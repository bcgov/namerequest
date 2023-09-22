import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'

/** Enum for Entity Type codes. */
export enum EntityTypes {
  // BC Entity Types:
  BC = CorpTypeCd.BC_COMPANY,
  BEN = CorpTypeCd.BENEFIT_COMPANY,
  C = CorpTypeCd.CONTINUE_IN,
  CC = CorpTypeCd.BC_CCC,
  CCC = CorpTypeCd.CCC_CONTINUE_IN,
  CP = CorpTypeCd.COOP,
  CR = CorpTypeCd.CORPORATION,
  CUL = CorpTypeCd.ULC_CONTINUE_IN,
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
  ULC = CorpTypeCd.BC_ULC_COMPANY,

  // XPRO Entity Types:
  A = CorpTypeCd.EXTRA_PRO_A,
  LLC = CorpTypeCd.LIMITED_CO,
  RLC = CorpTypeCd.XPRO_LIMITED_LIABILITY_COMPANY,
  XCP = CorpTypeCd.XPRO_COOP,
  XCR = CorpTypeCd.XPRO_CORPORATION,
  XLL = CorpTypeCd.XPRO_LIMITED_LIABILITY_PARTNERSHIP,
  XLP = CorpTypeCd.XPRO_LIMITED_PARTNERSHIP,
  XL = CorpTypeCd.XPRO_LL_PARTNR,
  XP = CorpTypeCd.XPRO_LIMITED_PARTNERSHIP,
  XS = CorpTypeCd.XPRO_SOCIETY,
  XSO = CorpTypeCd.XPRO_SOCIETY_NR,
  XUL = CorpTypeCd.XPRO_UNLIMITED_LIABILITY_COMPANY,

  INFO = 'INFO' as any // special value for sub-menu
}
