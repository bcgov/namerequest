def NAMESPACE = 'servicebc-ne'
def COMPONENT_NAME = 'namerequest-ui'
def SOURCE_TAG = 'dev'
def DEPLOY_TAG = 'test'
def PREV_TAG = "${DEPLOY_TAG}-previous"

// define groovy functions
import groovy.json.JsonOutput

// Get an image's hash tag
String getImageTagHash(String imageName, String tag = "") {

  if(!tag?.trim()) {
    tag = "latest"
  }

  def istag = openshift.raw("get istag ${imageName}:${tag} -o template --template='{{.image.dockerImageReference}}'")
  return istag.out.tokenize('@')[1].trim()
}

// pipeline
// define job properties - keep 10 builds only
properties([
    [$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '10'
        ]
    ]
])

node {
    def old_version
    stage("Deploy ${COMPONENT_NAME}:${DEPLOY_TAG}") {
        script {
            openshift.withCluster() {
                openshift.withProject("${NAMESPACE}-${DEPLOY_TAG}") {
                    old_version = openshift.selector('dc', "${COMPONENT_NAME}").object().status.latestVersion
                }
            }
            openshift.withCluster() {
                openshift.withProject() {

                    echo "Tagging ${COMPONENT_NAME}:${DEPLOY_TAG} to ${DEPLOY_TAG}-previous ..."

                    // Don't tag with BUILD_ID so the pruner can do it's job; it won't delete tagged images.
                    // Tag the images for deployment based on the image's hash
                    def IMAGE_HASH = getImageTagHash("${COMPONENT_NAME}", "${DEPLOY_TAG}")
                    echo "IMAGE_HASH: ${IMAGE_HASH}"
                    openshift.tag("${COMPONENT_NAME}@${IMAGE_HASH}", "${COMPONENT_NAME}:${DEPLOY_TAG}-previous")

                    echo "Tagging ${COMPONENT_NAME} for deployment to ${DEPLOY_TAG} ..."

                    IMAGE_HASH = getImageTagHash("${COMPONENT_NAME}", "${SOURCE_TAG}")
                    echo "IMAGE_HASH: ${IMAGE_HASH}"
                    openshift.tag("${COMPONENT_NAME}@${IMAGE_HASH}", "${COMPONENT_NAME}:${DEPLOY_TAG}")
                }
            }
        }
    }
}
