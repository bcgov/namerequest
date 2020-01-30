const jsonServer = require('json-server')
const server = jsonServer.create()
const middleware = jsonServer.defaults()

server.use(middleware)

//mock end point for wait-time stats
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
  let { query } = req
  let split = query.name.split(' ')
  let l = split.length
  let resp

  //add_descriptive
  if (split.includes('Smart')) {
    let index = split.indexOf('Smart')
    resp = {
      header: 'Further Action Required',
        issues: [
        {
          conflicts: null,
          consenting_body: null,
          designations: null,
          issue_type: 'add_descriptive',
          line1: 'Requires a Business Category Word',
          line2: '',
          name_actions: [
            {
              index: l - 1,
              message: 'Add a Descriptive Word Here',
              position: 'end',
              type: 'brackets',
              word: 'Smart'
            }
          ],
          setup: [
            {
              button: '',
              checkbox: '',
              header: 'Helpful Hint',
              line1: 'Add a word to the end of your name that describes the business category.',
              line2: '',
            }
          ],
          show_examination_button: false,
          show_reserve_button: false
        }
      ],
        status: 'fa'
    }
  }
  //add_distinctive
  if (split.includes('Distributors')) {
    let index = split.indexOf('Distributors')
    resp = {
      header: 'Further Action Required',
      issues: [
        {
          conflicts: null,
          consenting_body: null,
          designations: null,
          issue_type: 'add_distinctive',
          line1: 'Requires a word at the beggining of your name that sets it apart.',
          line2: '',
          name_actions: [
            {
              index: 0,
              message: 'Add a Word Here',
              position: 'start',
              type: 'brackets',
              word: split[0]
            }
          ],
          setup: [
            {
              button: '',
              checkbox: '',
              header: 'Helpful Hint',
              line1: "Some words that can set your name apart include an individual's name or intials; a" +
                 "geographic location; a colour; a coined, made-up word; or an acronym.",
              line2: '',
            }
          ],
          show_examination_button: false,
          show_reserve_button: false
        }
      ],
      status: 'fa'
    }
  }
  //consent_required
  if (split.includes('Engineering')) {
    let index = split.indexOf('Engineering')
    resp = {
      header: 'May be Approved With Consent',
      issues: [
        {
          conflicts: null,
          consenting_body: {
            name: 'Association of Professional Engineers of BC',
            email: 'email@engineer.ca'
          },
          designations: null,
          issue_type: 'consent_required',
          line1: '',
          line2: '',
          name_actions: [
            {
              index: index,
              type: 'highlight',
              word: 'Engineering'
            }
          ],
          setup: [
            {
              button: '',
              checkbox: '',
              header: 'Option 1',
              line1: 'You can remove or replace the word <b>“Engineering”</b> and try your search again.',
              line2: ''
            },
            {
              button: 'examine',
              checkbox: '',
              header: 'Option 2',
              line1: 'You can choose to submit this name for examination. Examination wait times are listed above.',
              line2: ''
            },
            {
              button: 'consent_body',
              checkbox: '',
              header: 'Option 3',
              line1: 'This name can be auto-approved but you will be required to send written consent to ' +
                 'the BC Business Registry.',
              line2: ''
            }
          ],
          show_examination_button: false,
          show_reserve_button: false
        }
      ],
      status: 'rc'
    }
  }
  //corp_conflict
  if (split[0] === 'Conflict') {
    resp = {
      header: 'Further Action Required',
      issues: [
        {
          conflicts: [
            {
              name: `${split[1]} Enterprises Ltd`,
              date: '12/21/1988'
            },
            {
              name: `${split[1]} Development Ltd`,
              date: '2/14/2004'
            }
          ],
          consenting_body: null,
          designations: null,
          issue_type: 'corp_conflict',
          line1: 'Too similar to an existing name.',
          line2: '',
          name_actions: [
            {
              index: 0,
              message: 'Add a Word Here',
              position: 'start',
              type: 'brackets',
              word: split[0]
            },
            {
              index: 1,
              type: 'strike',
              word: split[1]
            }
          ],
          setup: [
            {
              button: '',
              checkbox: '',
              header: 'Option 1',
              line1: 'Add a word to the beginning of the name that sets it apart like a person’s name or initials.',
              line2: `Or remove <b>${split[1]}</b> and replace it with a different word`
            },
            {
              button: 'examine',
              checkbox: '',
              header: 'Option 2',
              line1: 'You can choose to submit this name for examination. Examination wait times are listed above.',
              line2: ''
            },
            {
              button: 'consent_corp',
              checkbox: '',
              header: 'Option 3',
              line1: 'If you are the registered owner of the conflicting name, it can be auto-approved but you are ' +
                 'required to send written consent to the BC Business Registry.',
              line2: ''
            }
          ],
          show_examination_button: false,
          show_reserve_button: false
        }
      ],
      status: 'fa'
    }
  }
  //excess_words
  if (split.length > 4) {
    resp = {
      header: 'Further Action Required',
      issues: [
        {
          conflicts: null,
          consenting_body: null,
          designations: null,
          issue_type: 'excess_words',
          line1: 'This name is too long to be auto-approved.',
          line2: '',
          name_actions: null,
          setup: [
            {
              button: '',
              checkbox: '',
              header: 'Helpful Hint',
              line1: 'You can remove one or more words and try your search again, or you can choose to submit the ' +
                 'name above for examination.',
              line2: ''
            }
          ],
          show_examination_button: true,
          show_reserve_button: false
        }
      ],
      status: 'fa'
    }
  }
  //unclassified_word
  if (split.includes('Flerkin')) {
    let index = split.indexOf('Flerkin')
    resp = {
      header: 'Further Action Required',
      issues: [
        {
          conflicts: null,
          consenting_body: null,
          designations: null,
          issue_type: 'unclassified_word',
          line1: '<b>Flerkin</b> is an unknown word.  The system cannot auto-approve a name with unknown words.',
          line2: 'It might still be approvable by manual examination.',
          name_actions: [
            {
              index: index,
              type: 'highlight',
              word: 'flerkin',
            }
          ],
          setup: [
            {
              button: '',
              checkbox: '',
              header: 'Helpful Hint',
              line1: 'You can remove or replace the word <b>Flerkin</b> and try your search again.  Alternately, ' +
                 'you can submit your name for examination-wait times are quoted above.',
              line2: ''
            }
          ],
          show_examination_button: true,
          show_reserve_button: false
        }
      ],
      status: 'fa'
    }
  }
  //word_to_avoid
  if (split.includes('Walmart')) {
    let index = split.indexOf('Walmart')
    resp = {
      header: 'Further Action Required',
      issues: [
        {
          conflicts: null,
          consenting_body: null,
          designations: null,
          issue_type: 'word_to_avoid',
          line1: 'Your name contains words that cannot be approved:',
          line2: 'Walmart',
          name_actions: [
            {
              type: 'strike',
              word: 'Walmart',
              index: index
            }
          ],
          setup: [
            {
              button: '',
              checkbox: '',
              header: 'Helpful Hint',
              line1: 'Remove the word <b>Walmart</b> from your search and try again.',
              line2: ''
            }
          ],
          show_examination_button: false,
          show_reserve_button: false
        }
      ],
      status: 'fa'
    }
  }
  //wrong_designation
  if (split[l - 1] === 'Cooperative') {
    resp = {
      header: 'Further Action Required',
      issues: [
        {
          conflicts: null,
          consenting_body: null,
          designations: [
            'Inc',
            'Incorporated',
            'Incorpore',
            'Limite',
            'Limited',
            'Ltd'
          ],
          issue_type: 'wrong_designation',
          line1: 'Designation <b>Cooperative</b> cannot be used with selected business type of <b>Corporation</b>',
          line2: '',
          name_actions: [
            {
              index: l - 1,
              type: 'highlight',
              word: 'Cooperative',
            }
          ],
          setup: [
            {
              button: 'designation',
              checkbox: '',
              header: 'Option 1',
              line1: 'If your intention was to reserve a name for a BC Corporation, you can replace Cooperative ' +
                 'with a comptatible designation.  The folling are allowed:',
              line2: ''
            },
            {
              button: 'restart',
              checkbox: '',
              header: 'Option 2',
              line1: 'If you would like to start a Cooperative business instead of a Corporation, start your ' +
                 'search over and change your business type to “Cooperative”.',
              line2: ''
            }
          ],
          show_examination_button: false,
          show_reserve_button: false
        }
      ],
      status: 'fa'
    }
  }
  //consent_required + wrong_designation
  if (split.includes('Engineering') && split.includes('Cooperative')) {
    let index = split.indexOf('Engineering')
    resp = {
      header: 'Further Action Required',
      issues: [
        {
          conflicts: null,
          consenting_body: {
            name: 'Association of Professional Engineers of BC',
            email: 'email@engineer.ca'
          },
          designations: null,
          issue_type: 'consent_required',
          line1: '',
          line2: '',
          name_actions: [
            {
              index: index,
              type: 'highlight',
              word: 'Engineering'
            }
          ],
          setup: [
            {
              button: '',
              checkbox: '',
              header: 'Option 1',
              line1: 'You can remove or replace the word <b>“Engineering”</b> and try your search again.',
              line2: ''
            },
            {
              button: '',
              checkbox: 'examine',
              header: 'Option 2',
              line1: 'You can choose to submit this name for examination. Examination wait times are listed above.',
              line2: ''
            },
            {
              button: '',
              checkbox: 'consent_body',
              header: 'Option 3',
              line1: 'This name can be auto-approved but you will be required to send written consent to ' +
                 'the BC Business Registry.',
              line2: ''
            }
          ],
          show_next_button: true,
          show_examination_button: false,
          show_reserve_button: false
        },
        {
          conflicts: null,
          consenting_body: null,
          designations: [
            'Limited',
            'Limite',
            'Ltd',
            'Incorporated',
            'Incorpore',
            'Inc'
          ],
          issue_type: 'wrong_designation',
          line1: 'Designation <b>Cooperative</b> cannot be used with selected business type of <b>Corporation</b>',
          line2: '',
          name_actions: [
            {
              type: 'highlight',
              word: 'Cooperative',
              index: l - 1
            }
          ],
          setup: [
            {
              button: 'designation',
              checkbox: '',
              header: 'Option 1',
              line1: 'If your intention was to reserve a name for a BC Corporation, you can replace Cooperative ' +
                 'with a comptatible designation.  The folling are allowed:',
              line2: ''
            },
            {
              button: 'restart',
              checkbox: '',
              header: 'Option 2',
              line1: 'If you would like to start a Cooperative business instead of a Corporation, start your ' +
                 'search over and change your business type to “Cooperative”.',
              line2: ''
            }
          ],
          show_next_button: false,
          show_examination_button: false,
          show_reserve_button: false
        }
      ],
      status: 'fa'
    }
  }
  //corp_conflict + wrong_designation
  if (split.includes('Conflict') && split.includes('Cooperative')) {
    let index = split.indexOf('Engineering')
    resp = {
      header: 'Further Action Required',
      issues: [
        {
          conflicts: [
            {
              name: `${split[1]} Enterprises Ltd`,
              date: '12/21/1988'
            },
            {
              name: `${split[1]} Development Ltd`,
              date: '2/14/2004'
            }
          ],
          consenting_body: null,
          designations: null,
          issue_type: 'corp_conflict',
          line1: 'Too similar to an existing name.',
          line2: '',
          name_actions: [
            {
              index: 0,
              message: 'Add a Word Here',
              position: 'start',
              type: 'brackets',
              word: split[0]
            },
            {
              index: 1,
              type: 'strike',
              word: split[1]
            }
          ],
          setup: [
            {
              button: '',
              checkbox: '',
              header: 'Option 1',
              line1: 'Add a word to the beginning of the name that sets it apart like a person’s name or initials.',
              line2: `Or remove <b>${split[1]}</b> and replace it with a different word`
            },
            {
              button: '',
              checkbox: 'examine',
              header: 'Option 2',
              line1: 'You can choose to submit this name for examination. Examination wait times are listed above.',
              line2: ''
            },
            {
              button: '',
              checkbox: 'consent_corp',
              header: 'Option 3',
              line1: 'If you are the registered owner of the conflicting name, it can be auto-approved but you are ' +
                'required to send written consent to the BC Business Registry.',
              line2: ''
            }
          ],
          show_examination_button: false,
          show_reserve_button: false
        },
        {
          conflicts: null,
          consenting_body: null,
          designations: [
            'Limited',
            'Limite',
            'Ltd',
            'Incorporated',
            'Incorpore',
            'Inc'
          ],
          issue_type: 'wrong_designation',
          line1: 'Designation <b>Cooperative</b> cannot be used with selected business type of <b>Corporation</b>',
          line2: '',
          name_actions: [
            {
              type: 'highlight',
              word: 'Cooperative',
              index: l - 1
            }
          ],
          setup: [
            {
              button: 'designation',
              checkbox: '',
              header: 'Option 1',
              line1: 'If your intention was to reserve a name for a BC Corporation, you can replace Cooperative ' +
                'with a comptatible designation.  The folling are allowed:',
              line2: ''
            },
            {
              button: 'restart',
              checkbox: '',
              header: 'Option 2',
              line1: 'If you would like to start a Cooperative business instead of a Corporation, start your ' +
                'search over and change your business type to “Cooperative”.',
              line2: ''
            }
          ],
          show_next_button: false,
          show_examination_button: false,
          show_reserve_button: false
        }
      ],
      status: 'fa'
    }
  }
  //consent_required + corp_conflict
  if (split.includes('Engineering') && split.includes('Conflict')) {
    let index = split.indexOf('Engineering')
    resp = {
      header: 'Further Action Required',
      issues: [
        {
          conflicts: null,
          consenting_body: {
            name: 'Association of Professional Engineers of BC',
            email: 'email@engineer.ca'
          },
          designations: null,
          issue_type: 'consent_required',
          line1: '',
          line2: '',
          name_actions: [
            {
              index: index,
              type: 'highlight',
              word: 'Engineering'
            }
          ],
          setup: [
            {
              button: '',
              checkbox: '',
              header: 'Option 1',
              line1: 'You can remove or replace the word <b>“Engineering”</b> and try your search again.',
              line2: ''
            },
            {
              button: '',
              checkbox: 'examine',
              header: 'Option 2',
              line1: 'You can choose to submit this name for examination. Examination wait times are listed above.',
              line2: ''
            },
            {
              button: '',
              checkbox: 'consent_body',
              header: 'Option 3',
              line1: 'This name can be auto-approved but you will be required to send written consent to ' +
                 'the BC Business Registry.',
              line2: ''
            }
          ],
          show_next_button: true,
          show_examination_button: false,
          show_reserve_button: false
        },
        {
          conflicts: [
            {
              name: `${split[1]} Enterprises Ltd`,
              date: '12/21/1988'
            },
            {
              name: `${split[1]} Development Ltd`,
              date: '2/14/2004'
            }
          ],
          consenting_body: null,
          designations: null,
          issue_type: 'corp_conflict',
          line1: 'Too similar to an existing name.',
          line2: '',
          name_actions: [
            {
              index: 0,
              message: 'Add a Word Here',
              position: 'start',
              type: 'brackets',
              word: split[0]
            },
            {
              index: 1,
              type: 'strike',
              word: split[1]
            }
          ],
          setup: [
            {
              button: '',
              checkbox: '',
              header: 'Option 1',
              line1: 'Add a word to the beginning of the name that sets it apart like a person’s name or initials.',
              line2: `Or remove <b>${split[1]}</b> and replace it with a different word`
            },
            {
              button: 'examine',
              checkbox: '',
              header: 'Option 2',
              line1: 'You can choose to submit this name for examination. Examination wait times are listed above.',
              line2: ''
            },
            {
              button: 'consent_corp',
              checkbox: '',
              header: 'Option 3',
              line1: 'If you are the registered owner of the conflicting name, it can be auto-approved but you are ' +
                 'required to send written consent to the BC Business Registry.',
              line2: ''
            }
          ],
          show_examination_button: false,
          show_reserve_button: false
        }
      ],
      status: 'fa'
    }
  }
  //consent_required + corp_conflict + wrong_designation
  if (split.includes('Engineering') && split.includes('Conflict') && split.includes('Cooperative')) {
    let index = split.indexOf('Engineering')
    resp = {
      header: 'Further Action Required',
      issues: [
        {
          conflicts: null,
          consenting_body: {
            name: 'Association of Professional Engineers of BC',
            email: 'email@engineer.ca'
          },
          designations: null,
          issue_type: 'consent_required',
          line1: '',
          line2: '',
          name_actions: [
            {
              index: index,
              type: 'highlight',
              word: 'Engineering'
            }
          ],
          setup: [
            {
              button: '',
              checkbox: '',
              header: 'Option 1',
              line1: 'You can remove or replace the word <b>“Engineering”</b> and try your search again.',
              line2: ''
            },
            {
              button: '',
              checkbox: 'examine',
              header: 'Option 2',
              line1: 'You can choose to submit this name for examination. Examination wait times are listed above.',
              line2: ''
            },
            {
              button: '',
              checkbox: 'consent_body',
              header: 'Option 3',
              line1: 'This name can be auto-approved but you will be required to send written consent to ' +
                 'the BC Business Registry.',
              line2: ''
            }
          ],
          show_next_button: true,
          show_examination_button: false,
          show_reserve_button: false
        },
        {
          conflicts: [
            {
              name: `${split[1]} Enterprises Ltd`,
              date: '12/21/1988'
            },
            {
              name: `${split[1]} Development Ltd`,
              date: '2/14/2004'
            }
          ],
          consenting_body: null,
          designations: null,
          issue_type: 'corp_conflict',
          line1: 'Too similar to an existing name.',
          line2: '',
          name_actions: [
            {
              index: 0,
              message: 'Add a Word Here',
              position: 'start',
              type: 'brackets',
              word: split[0]
            },
            {
              index: 1,
              type: 'strike',
              word: split[1]
            }
          ],
          setup: [
            {
              button: '',
              checkbox: '',
              header: 'Option 1',
              line1: 'Add a word to the beginning of the name that sets it apart like a person’s name or initials.',
              line2: `Or remove <b>${split[1]}</b> and replace it with a different word`
            },
            {
              button: '',
              checkbox: 'examine',
              header: 'Option 2',
              line1: 'You can choose to submit this name for examination. Examination wait times are listed above.',
              line2: ''
            },
            {
              button: '',
              checkbox: 'consent_body',
              header: 'Option 3',
              line1: 'If you are the registered owner of the conflicting name, it can be auto-approved but you are  ' +
                 'required to send written consent to the BC Business Registry.',
              line2: ''
            }
          ],
          show_examination_button: false,
          show_reserve_button: false
        },
        {
          conflicts: null,
          consenting_body: null,
          designations: [
            'Limited',
            'Limite',
            'Ltd',
            'Incorporated',
            'Incorpore',
            'Inc'
          ],
          issue_type: 'wrong_designation',
          line1: 'Designation <b>Cooperative</b> cannot be used with selected business type of <b>Corporation</b>',
          line2: '',
          name_actions: [
            {
              type: 'highlight',
              word: 'Cooperative',
              index: l - 1
            }
          ],
          setup: [
            {
              button: 'designation',
              checkbox: '',
              header: 'Option 1',
              line1: 'If your intention was to reserve a name for a BC Corporation, you can replace Cooperative ' +
                 'with a comptatible designation.',
              line2: ''
            },
            {
              button: 'restart',
              checkbox: '',
              header: 'Option 2',
              line1: 'If you would like to start a Cooperative business instead of a Corporation, start your ' +
                 'search over and change your business type to “Cooperative”.',
              line2: ''
            }
          ],
          show_next_button: false,
          show_examination_button: false,
          show_reserve_button: false
        }
      ],
      status: 'fa'
    }
  }

  //unclassified_word + consent_required
  if (split.includes('Engineering') && split.includes('Flerkij')) {
    let index = split.indexOf('Engineering')
    resp = {
      header: 'Further Action Required',
      issues: [
        {
          conflicts: null,
          consenting_body: {
            name: 'Association of Professional Engineers of BC',
            email: 'email@engineer.ca'
          },
          designations: null,
          issue_type: 'consent_required',
          line1: '',
          line2: '',
          name_actions: [
            {
              index: index,
              type: 'highlight',
              word: 'Engineering'
            }
          ],
          setup: [
            {
              button: '',
              checkbox: '',
              header: 'Option 1',
              line1: 'You can remove or replace the word <b>“Engineering”</b> and try your search again.',
              line2: ''
            },
            {
              button: '',
              checkbox: 'examine',
              header: 'Option 2',
              line1: 'You can choose to submit this name for examination. Examination wait times are listed above.',
              line2: ''
            },
            {
              button: '',
              checkbox: 'consent_body',
              header: 'Option 3',
              line1: 'This name can be auto-approved but you will be required to send written consent to ' +
                'the BC Business Registry.',
              line2: ''
            }
          ],
          show_next_button: true,
          show_examination_button: false,
          show_reserve_button: false
        },
        {
          conflicts: [
            {
              name: `${split[1]} Enterprises Ltd`,
              date: '12/21/1988'
            },
            {
              name: `${split[1]} Development Ltd`,
              date: '2/14/2004'
            }
          ],
          consenting_body: null,
          designations: null,
          issue_type: 'corp_conflict',
          line1: 'Too similar to an existing name.',
          line2: '',
          name_actions: [
            {
              index: 0,
              message: 'Add a Word Here',
              position: 'start',
              type: 'brackets',
              word: split[0]
            },
            {
              index: 1,
              type: 'strike',
              word: split[1]
            }
          ],
          setup: [
            {
              button: '',
              checkbox: '',
              header: 'Option 1',
              line1: 'Add a word to the beginning of the name that sets it apart like a person’s name or initials.',
              line2: `Or remove <b>${split[1]}</b> and replace it with a different word`
            },
            {
              button: '',
              checkbox: 'examine',
              header: 'Option 2',
              line1: 'You can choose to submit this name for examination. Examination wait times are listed above.',
              line2: ''
            },
            {
              button: '',
              checkbox: 'consent_body',
              header: 'Option 3',
              line1: 'If you are the registered owner of the conflicting name, it can be auto-approved but you are  ' +
                'required to send written consent to the BC Business Registry.',
              line2: ''
            }
          ],
          show_examination_button: false,
          show_reserve_button: false
        },
        {
          conflicts: null,
          consenting_body: null,
          designations: [
            'Limited',
            'Limite',
            'Ltd',
            'Incorporated',
            'Incorpore',
            'Inc'
          ],
          issue_type: 'wrong_designation',
          line1: 'Designation <b>Cooperative</b> cannot be used with selected business type of <b>Corporation</b>',
          line2: '',
          name_actions: [
            {
              type: 'highlight',
              word: 'Cooperative',
              index: l - 1
            }
          ],
          setup: [
            {
              button: 'designation',
              checkbox: '',
              header: 'Option 1',
              line1: 'If your intention was to reserve a name for a BC Corporation, you can replace Cooperative ' +
                'with a comptatible designation.',
              line2: ''
            },
            {
              button: 'restart',
              checkbox: '',
              header: 'Option 2',
              line1: 'If you would like to start a Cooperative business instead of a Corporation, start your ' +
                'search over and change your business type to “Cooperative”.',
              line2: ''
            }
          ],
          show_next_button: false,
          show_examination_button: false,
          show_reserve_button: false
        }
      ],
      status: 'fa'
    }
  }
  //Approved name for BC Corporation

  if (!resp) {
    resp = {
      status: 'ap',
      issues: null,
      header: 'This name is approvable and can be reserved now'
    }
  }

  setTimeout(() => { res.jsonp(resp) }, 2000)
})

server.listen(5000, () => {
  console.log(`json-server mock API listening on http://localhost:5000`)
})
