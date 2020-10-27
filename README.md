
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](../LICENSE)
[![codecov](https://codecov.io/gh/bcgov/namerequest/branch/master/graph/badge.svg)](https://codecov.io/gh/bcgov/namerequest)

---
description: NameRequest readme
ignore: true
---

## About

TBD.

## Usage

### Local Development

1.  Clone or fork the repo
2.  Open a terminal window and cd to the top level of the repo, then cd to the /client directory
3.  Install node modules, enter command 'npm install'
4.  To run with mock namex backend, enter command 'npm run serve-mock'
5.  In a separate terminal window, run the mock server, enter command 'node server.js'
6.  The mock backend uses keywords in the name search at either the first or second word position
    non-approving keywords are:
    add beginning
    add end
    consent
    bad
    wrong

    approving keywords are:
    approve corp
    approve sole
    approve gp

## Deployment (OpenShift)

TBD

## Getting Help or Reporting an Issue

To report bugs/issues/feature requests, please file an [issue](https://github.com/bcgov/namerequest/issues/).

## How to Contribute

If you would like to contribute, please see our [CONTRIBUTING](CONTRIBUTING.md) guidelines.

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md).
By participating in this project you agree to abide by its terms.

## Issues/Suggestions
Make Suggestions/Issues [here!](https://github.com/bcgov/namerequest/issues/new)
Issues are [markdown supported](https://guides.github.com/features/mastering-markdown/).

## License

    Copyright 2020 Province of British Columbia

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
