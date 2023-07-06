import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'

/** Enum for Entity Type codes. */
export enum EntityType {
  // BC Entity Types:
  BC = CorpTypeCd.BC_COMPANY,
  CC = CorpTypeCd.BC_CCC,
  CP = CorpTypeCd.COOP,
  CR = CorpTypeCd.BC_CORPORATION,
  DBA = CorpTypeCd.DOING_BUSINESS_AS,
  FI = CorpTypeCd.FINANCIAL,
  FR = CorpTypeCd.NR_SOLE_PROP,
  GP = CorpTypeCd.PARTNERSHIP,
  LL = CorpTypeCd.LL_PARTNERSHIP,
  LP = CorpTypeCd.LIM_PARTNERSHIP,
  PA = CorpTypeCd.PRIVATE_ACT,
  PAR = CorpTypeCd.PARISHES,
  SO = 'SO',
  SP = CorpTypeCd.SOLE_PROP,
  UL = CorpTypeCd.BC_UNLIMITED,

  // XPRO Entity Types:
  XCR = CorpTypeCd.XPRO_CORPORATION,
  XUL = 'XUL',
  RLC = 'RLC',
  XLP = 'XLP',
  XLL = 'XLL',
  XCP = CorpTypeCd.XPRO_COOP,
  XSO = 'XSO',

  INFO = 'INFO', // special value for sub-menu
}
