import { RequestActionsI } from '@/models'

export const RequestActions: RequestActionsI[] = [
  {
    text: 'Register or Incorporate a',
    shortDesc: 'New Request',
    value: 'NEW',
    blurbs: `Create a new business in British Columbia or register a business you formed in another province or
              territory, country or federal jurisdiction so that you may also conduct business here in BC.`
  },
  {
    text: 'Relocate into',
    shortDesc: 'Move Request',
    value: 'MVE',
    blurbs: `Transfer a corporation you formed in another jurisdiction so that it becomes a BC company.`
  },
  // COMMENTED OUT FOR FUTURE IMPLEMENTATION
  // {
  //   text: 'Assume a New Name in BC',
  //   shortDesc: 'Assumed Name Request',
  //   value: 'ASSUMED',
  //   blurb: `You have an existing business in another province. You are closing your business there and moving your
  //           business to BC, however, the name of your business is already in use in BC`
  // },
  {
    text: 'Restore or Reinstate a',
    shortDesc: 'Restore-Historical Request',
    value: 'REH',
    blurbs: `You have a corporation, cooperative association, society or financial institution that has been dissolved
              or cancelled.  You want to start up again and use the same name or a new name.  You will need the
              incorporation number assigned to you by BC Registries and Online Services.`
  },
  {
    text: 'Amalgamate two or more',
    shortDesc: 'Amalgamation Request',
    value: 'AML',
    blurbs: 'You have two or more businesses that you want to combine to create a new business.'
  },
  {
    text: 'Change the name of an existing',
    shortDesc: 'Change of Name Request',
    value: 'CHG',
    blurbs: `You have an existing business that is registered or incorporated in BC and you want to change your name.
              You will need the incorporation or firm number assigned to you by BC Registries and Online Services.`
  },
  {
    text: 'Change (alter) the business type of a',
    shortDesc: 'Conversion Request',
    value: 'CNV',
    blurbs: `You want to alter from one type of corporation to another.  For example you are a limited company and
              want to become an unlimited liability company.   You will need the incorporation number assigned to you
              by BC Registries and Online Services.`
  }
  // COMMENTED OUT FOR FUTURE IMPLEMENTATION
  // {
  //   text: 'Restore with a New Name',
  //   shortDesc: 'Restore-New Request',
  //   value: 'REN',
  //   blurb: `You have a business that has been dissolved or cancelled. You want to start up again with a new name.
  //           You will need your incorporation or firm number assigned to you by Registries.`
  // }
]
