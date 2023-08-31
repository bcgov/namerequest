import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'

/** Enum for Entity Type codes. */
export enum EntityType {
  // BC Entity Types:
  BC = CorpTypeCd.BC_COMPANY,
  CC = CorpTypeCd.BC_CCC,
  CP = CorpTypeCd.COOP,
  CR = CorpTypeCd.CORPORATION,
  DBA = CorpTypeCd.DOING_BUSINESS_AS,
  FI = CorpTypeCd.FINANCIAL,
  FR = CorpTypeCd.SOLE_PROPRIETORSHIP,
  GP = CorpTypeCd.PARTNERSHIP,
  LL = CorpTypeCd.LL_PARTNERSHIP,
  LP = CorpTypeCd.LIM_PARTNERSHIP,
  PA = CorpTypeCd.PRIVATE_ACT,
  PAR = CorpTypeCd.PARISHES,
  SO = CorpTypeCd.SOCIETY_NR,
  SP = CorpTypeCd.SOLE_PROP,
  UL = CorpTypeCd.UNLIMITED_LIABILITY_COMPANY,

  // XPRO Entity Types:
  RLC = CorpTypeCd.XPRO_LIMITED_LIABILITY_COMPANY,
  XCR = CorpTypeCd.XPRO_CORPORATION,
  XLL = CorpTypeCd.XPRO_LIMITED_LIABILITY_PARTNERSHIP,
  XLP = CorpTypeCd.XPRO_LIMITED_PARTNERSHIP,
  XSO = CorpTypeCd.XPRO_SOCIETY_NR,
  XUL = CorpTypeCd.XPRO_UNLIMITED_LIABILITY_COMPANY,

  // XPRO Entity types + restorable:
  A = CorpTypeCd.EXTRA_PRO_A,
  LLC = CorpTypeCd.LIMITED_CO,
  XCP = CorpTypeCd.XPRO_COOP,
  XS = CorpTypeCd.XPRO_SOCIETY,

  INFO = 'INFO' as any // special value for sub-menu
}
