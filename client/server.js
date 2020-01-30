const jsonServer = require('json-server')
const server = jsonServer.create()
const middleware = jsonServer.defaults()

server.use(middleware)

server.get('/api/v1/stats', (req, res) => {
  let o = Math.random()
  let p = o.toString()
  let resp = {
    auto: p[3] + p[2],
    priority: {
      value:  p[5] + p[9],
      unit: 'mins'
    },
    standard: {
      value: p[4],
      unit: 'days'
    }
  }

  setTimeout(() => { res.jsonp(resp) }, 150)
})

server.get('/api/v1/name-analysis', (req, res) => {
  let query = req.query
  let split = query.name.split(' ')
  let l = split.length
  let resp

  if (query.name === 'Demo Name Actions Renderer') {
    resp = {
      "status": "Further Action Required",
      "issues": [
        {
          "consenting_body": null,
          "issue_type": "add_distinctive",
          "name_actions": [
            {
              "type": "add_word_brackets",
              "position": "start",
              "message": "1-start",
              "word_index": 0
            },
            {
              "type": "add_word_brackets",
              "position": "end",
              "message": "1-end",
              "word_index": 0
            },
            {
              "type": "add_word_brackets",
              "position": "start",
              "message": "3-start",
              "word_index": 2
            },
            {
              "type": "add_word_brackets",
              "position": "end",
              "message": "3-end",
              "word_index": 2
            },
            {
              "type": "add_word_brackets",
              "position": "end",
              "message": "End",
              "word_index": 3
            },
            {
              "type": "spelling",
              "word_index": 1
            },
            {
              "type": "strike",
              "word_index": 2
            },
            {
              "type": "highlight",
              "word_index": 3
            }
          ],
          "designations": null,
          "descriptive_words": null,
          "show_examination_button": false,
          "conflicts": null,
          "word": null,
        }
      ]
    }
  }

  //Requires Distinctive word
  if (split.includes('Distributors')) {
    resp = {
      "status": "Further Action Required",
      "issues": [
        {
          "consenting_body": null,
          "issue_type": "add_distinctive",
          "name_actions": [
            {
              "type": "add_word_brackets",
              "position": "start",
              "message": "Add a Word Here",
              "word_index": 1
            },
            {
              "type": "add_word_brackets",
              "position": "end",
              "message": "Blah blah",
              "word_index": 0
            },
            {
              "type": "spelling",
              "word_index": 1
            }
          ],
          "designations": null,
          "descriptive_words": null,
          "show_examination_button": false,
          "conflicts": null,
          "word": null,
        }
      ]
    }
  }
  //Requires a descriptive word
  if (split.includes('Smart')) {
    resp = {
      "status": "Further Action Required",
      "issues": [
        {
          "consenting_body": null,
          "issue_type": "add_descriptive",
          "name_actions": [
            {
              "type": "add_word_brackets",
              "position": "end",
              "message": "Add a Business Category Word Here",
              "word_index": split.length - 1
            }
          ],
          "designations": null,
          "descriptive_words": [
            {
              "category": "Construction",
              "word_list":
                ["Building", "Contracting", "Exteriors", "Development", "Projects", "Project Management", "Renovations"]
            },
            { "category": "Landscaping", "word_list": ["Clearing", "Horticulture", "Gardeninbg", "Tree Care"] },
            { "category": "Construction", "word_list": ["Renovations", "Projects", "Contractors", "Development"] },
            { "category": "Pet Supplies", "word_list": ["Example1", "Example2"] },
            { "category": "Geothermal", "word_list": ["Example1", "Example2"] },
            { "category": "Space", "word_list": ["Example1", "Example2"] },
            { "category": "Engineering", "word_list": ["Example1", "Example2"] },
            { "category": "Consulting", "word_list": ["Example1", "Example2"] },
            { "category": "Demolition", "word_list": ["Example1", "Example2"] }
          ],
          "show_examination_button": false,
          "conflicts": null,
          "word": null,
        }
      ]
    }
  }
  //Contains an Unclassified Word
  if (split.includes('Flerkin')) {
    let index = split.indexOf('Flerkin')
    let w = split.indexOf('Flerkin')
    resp = {
      "status": "Further Action Required",
      "issues": [
        {
          "consenting_body": null,
          "issue_type": "unclassified_word",
          "name_actions": [
            {
              "type": "highlight",
              "word_index": index
            },
            {
              "type": "strike",
              "word_index": index
            }
          ],
          "descriptive_words": null,
          "designations": null,
          "show_examination_button": true,
          "conflicts": null,
        }
      ]
    }
  }
  //Approved name for BC Corporation
  if (split[0] === 'Available') {
    resp = {
      "status": "Available",
      "issues": null
    }
  }
 //Name has a Corporate Conflict
  if (split[0] === 'Conflict') {
    resp = {
      "status": "Further Action Required",
      "issues": [
        {
          "consenting_body": null,
          "issue_type": "corp_conflict",
          "word": [split[1]],
          "show_examination_button": false,
          "conflicts": [
            {
              "name": `${split[1]} Enterprises Ltd`,
              "date": "12/21/1988"
            },
            {
              "name": `${split[1]} Development Ltd`,
              "date": "2/14/2004"
            }
          ],
          "descriptive_words": null,
          "designations": ['inc', 'incorporated'],
          "name_actions": [
            {
              "type": "strike",
              "word_index": 0
            },
            {
              "type": "strike",
              "word_index": 1
            },
            {
              "type": "spelling",
              "word_index": 0
            },
            {
              "type": "spelling",
              "word_index": 1
            },
            {
              "type": "highlight",
              "word_index": 2
            },
            {
              "type": "add_word_brackets",
              "position": "start",
              "message": "Add a Word Here",
              "word_index": 0
            },
            {
              "type": "add_word_brackets",
              "position": "end",
              "message": "Add a Word Here",
              "word_index": 0
            },
            {
              "type": "add_word_brackets",
              "position": "start",
              "message": "Add a Word Here",
              "word_index": 1
            },
            {
              "type": "add_word_brackets",
              "position": "end",
              "message": "Add a Word Here",
              "word_index": 1
            }
          ]
        }
      ]
    }
  }
  //Name has a word to avoid
  if (split.includes('Walmart')) {
    let w = split.indexOf('Walmart')
    resp = {
      "status": "Further Action Required",
      "issues": [
        {
          "consenting_body": null,
          "issue_type": "word_to_avoid",
          "name_actions": [
            {
              "type": "strike",
              "word_index": w
            }
          ],
          "descriptive_words": null,
          "designations": null,
          "show_examination_button": false,
          "conflicts": [],
          "word": [split[w]],
        }
      ]
    }
  }
  if (split.includes('Walmart') && split.includes('7-11')) {
    let w = split.indexOf('Walmart')
    let x = split.indexOf('7-11')
    resp = {
      "status": "Further Action Required",

      "issues": [
        {
          "consenting_body": null,
          "issue_type": "word_to_avoid",
          "name_actions": [
            {
              "type": "strike",
              "word_index": w
            },
            {
              "type": "strike",
              "word_index": x
            }
          ],
          "descriptive_words": null,
          "designations": null,
          "show_examination_button": false,
          "conflicts": [],
          "word": [split[w], split[x]],
        }
      ]
    }
  }
  //Name requires consent
  if (split.includes('Engineering')) {
    let i = split.indexOf('Engineering')
    resp = {
      "status": "May be Approved With Consent",
      "issues": [
        {
          "consenting_body": {
            "name": "Association of Professional Engineers of BC",
            "email": "email@engineer.ca"
          },
          "issue_type": "consent_required",
          "word": ["Engineering"],
          "show_examination_button": false,
          "descriptive_words": null,
          "designations": null,
          "name_actions": [
            {
              "type": "highlight",
              "word_index": i,
            }
          ]
        }
      ]
    }
  }
  //Designation Mismatch
  if (split[l - 1] === 'Cooperative') {
    resp = {
      "status": "Further Action Required",
      "issues": [
        {
          "consenting_body": null,
          "issue_type": "wrong_designation",
          "word": [split[l - 1]],
                    "show_examination_button": false,
          "descriptive_words": null,
          "designations": ["Incorporated", "Inc", "Limited", "LTD", "Corporation", "Corp", "Limitee", "Incorporee"],
          "name_actions": [
            {
              "type": "highlight",
              "word_index": l - 1,
            }
          ]
        }
      ]
    }
  }
  //Too many words
  if (split.length > 4) {
    resp = {
      "status": "Further Action Required",
      "issues": [
        {
          "consenting_body": null,
          "issue_type": "excess_words",
          "name_actions": null,
          "descriptive_words": null,
          "designations": null,
          "show_examination_button": true,
          "conflicts": null,
          "word": null,
          "word_index": null
        }
      ]
    }
  }
  setTimeout(() => { res.jsonp(resp) }, 3000)
})

server.listen(3000, () => {
  console.log(`json-server mock API listening on http://localhost:3000`)
})