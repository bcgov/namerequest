export const baseItemsConflicts = {
  'errorExact': {
    icon: 'mdi-alert-octagon',
    iconColor: 'red darken-2',
    problem: 'There was an issue checking exact matches against your name',
    words: null,
    expandExtraInfo: false,
    expandedInfo1: '',
    expandedInfo2: null,
    expandedList: [],
    expandLabel: {
      closed: 'View Details',
      open: 'Hide Details'
    },
    count: 0,
    info: 'errorExact'
  },
  'errorSimilar': {
    icon: 'mdi-alert-octagon',
    iconColor: 'red darken-2',
    problem: 'There was an issue checking similar matches against your name',
    words: null,
    expandExtraInfo: false,
    expandedInfo1: '',
    expandedInfo2: null,
    expandedList: [],
    expandLabel: {
      closed: 'View Details',
      open: 'Hide Details'
    },
    count: 0,
    info: 'errorSimilar'
  },
  'exactMatch': {
    icon: 'mdi-alert-octagon',
    iconColor: 'red darken-2',
    problem: 'There is an existing BC Corporation using the <b>exact name</b>',
    words: null,
    expandExtraInfo: false,
    expandedInfo1: 'Exact name in use. A name will not be approved if there is an existing business using the exact same name.',
    expandedInfo2: null,
    expandedList: [],
    expandLabel: {
      closed: 'View Details',
      open: 'Hide Details'
    },
    count: 0,
    info: 'exactMatch'
  },
  'exactMatchXpro': {
    icon: 'mdi-alert-octagon',
    iconColor: 'red darken-2',
    problem: 'There is an existing BC Corporation using the <b>exact name</b>',
    words: null,
    expandExtraInfo: false,
    expandedInfo1: 'Exact name in use. You must use (assume) a new name unless ' +
    'you can obtain consent to use this name. You will need to change ' +
    'your business name in your home jurisdiction to match the assumed name in BC.',
    expandedInfo2: 'You will be able to enter up to two Assumed Name ' +
    'choices as part of the name request submission process. Assumed ' +
    'names must be reviewed by Registries staff.',
    expandedInfo3: '<b>To proceed, select "Submit this Name for Review".</b>',
    expandedList: [],
    expandLabel: {
      closed: 'View Details',
      open: 'Hide Details'
    },
    count: 0,
    info: 'exactMatchXpro'
  },
  'loading': {
    count: 0,
    expandedInfo1: null,
    expandedInfo2: null,
    expandedList: null,
    expandLabel: {
      open: null,
      closed: null
    },
    icon: null,
    iconColor: null,
    problem: 'loading',
    words: null
  },
  'noIssues': {
    icon: null,
    iconColor: null,
    info: 'No similar names have been found.',
    problem: '',
    words: [],
    expandedInfo1: null,
    expandedInfo2: null,
    expandedList: null,
    expandLabel: null,
    count: null
  },
  'similarMatch': {
    icon: 'mdi-alert',
    iconColor: 'orange darken-2',
    problem: 'There are existing BC Corporations using the <b>same or similar words</b>',
    words: null,
    expandExtraInfo: false,
    expandedInfo1: 'custom text for similarMatch in component',
    expandedInfo2: null,
    expandedList: [],
    expandLabel: {
      closed: 'View Details',
      open: 'Hide Details'
    },
    count: 0,
    info: 'similarMatch'
  },
  'similarMatchXpro': {
    icon: 'mdi-alert',
    iconColor: 'orange darken-2',
    problem: 'There are existing BC Corporations using the <b>same or similar words</b>',
    words: null,
    expandExtraInfo: false,
    expandedInfo1: 'No exact matches were found for your name, ' +
    'but you should review the above list to help determine if ' +
    'there is a similar business name already in use in BC that ' +
    'might prevent your name from being approved.',
    expandedInfo2: 'If an existing name is too similar to your ' +
    'name you will be required to use (assume) a new name in BC. ' +
    'You will be notified as part of the review process if you ' +
    'need to use an assumed name, or if consent is required to ' +
    'use your preferred name.',
    expandedInfo3: 'You will be able to enter up to two Assumed ' +
    'Name choices as part of the name request submission process, ' +
    'and it is recommended that you enter two Assumed Name choices. ' +
    'Assumed names must be reviewed by Registries staff.',
    expandedInfo4: '<b>To proceed, select "Submit this Name for Review".</b>',
    expandedList: [],
    expandLabel: {
      closed: 'View Details',
      open: 'Hide Details'
    },
    count: 0,
    info: 'similarMatchXpro'
  }
}
