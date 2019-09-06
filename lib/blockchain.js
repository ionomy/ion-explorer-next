
const params = {
  LAST_POW_BLOCK: 1000,
  DGW_START_HEIGHT:550000, //Zerocoin start height, starts together with DGW
};

const avgBlockTime = 60; // 1 minutes (60 seconds)

const blocksPerDay = (24 * 60 * 60) / avgBlockTime; // 960

const blocksPerWeek = blocksPerDay * 7; // 6720

const blocksPerMonth = (blocksPerDay * 365.25) / 12; // 29220

const blocksPerYear = blocksPerDay * 365.25; // 350640

const mncoins = 20000.0;

const getMNBlocksPerDay = (mns) => {
  return blocksPerDay / mns;
};

const getMNBlocksPerWeek = (mns) => {
  return getMNBlocksPerDay(mns) * (365.25 / 52);
};

const getMNBlocksPerMonth = (mns) => {
  return getMNBlocksPerDay(mns) * (365.25 / 12);
};

const getMNBlocksPerYear = (mns) => {
  return getMNBlocksPerDay(mns) * 365.25;
};

const getMNSubsidy = (nHeight = 0, nMasternodeCount = 0, nMoneySupply = 0) => {
  const blockValue = getSubsidy(nHeight);
  let ret = 0.0;

  let mNodeCoins = nMasternodeCount * mncoins;

  // if (Params().NetworkID() == CBaseChainParams::TESTNET) {
  //   if (nHeight < 200)
  //     return 0;
  // }

  if (nHeight >= 0 && nHeight <= params.LAST_POW_BLOCK) {
    ret = 0;
  } else if (nHeight > params.LAST_POW_BLOCK) {
    if (mNodeCoins === 0) {
      ret = 0;
    } else if (nHeight < params.DGW_START_HEIGHT) {
      ret = blockValue * .50;
    } else if (nHeight >= params.DGW_START_HEIGHT) {
      ret = blockValue * .50;
    }
  }

  return ret;
};

const getSubsidy = (nHeight = 1) => {
  let nSubsidy = 0;

  if (nHeight === 0) {
    // Genesis block
    return 0;
  } else if (nHeight === 1) {
    return 16400000;
  } else if (nHeight >= 2 && nHeight <= 125146) {
    return 23;
    /** cevap
     * info: DGW startheight, we will let make 0 reward + 0.01 Ion fee for 1 day (1440 blocks)
     * Current block: 541267
     */
  } else if (nHeight > 125146 && nHeight <= params.DGW_START_HEIGHT) {
    return 17
  } else if (nHeight > params.DGW_START_HEIGHT && nHeight <= params.DGW_START_HEIGHT + 1440) {
    return 0.02
  } else if (nHeight > params.DGW_START_HEIGHT + 1440 && nHeight <= 570062) { // 568622 + 1440 = 570062
    return 17
  } else if (nHeight > 570062 && nHeight <= 1013538) {    // 568622+1440=570062   1012098+1440=1013538
    return 11.5
  } else if (nHeight > 1013538 && nHeight <= 1457014) {    // 1012098+1440=1013538   1455574+1440=1457014
    return 5.75
  } else if (nHeight > 1457014 && nHeight <= 3677390) {    // 1455574+1440=1457014   3675950+1440=3677390
    return 1.85
  }
  // else if (nHeight > 3677390 && Params().NetworkID() == CBaseChainParams::TESTNET) {
  //   return 0.925
  // } else if (nHeight > 3677390 && Params().NetworkID() == CBaseChainParams::REGTEST) {
  //   return 17
  // }
  else {
    return 0.02
  }
  return nSubsidy;
};

const getROI = (subsidy, mns) => {
  return ((getMNBlocksPerYear(mns) * subsidy) / mncoins) * 100.0;
};

const isAddress = (s) => {
  return typeof(s) === 'string' && s.length === 34;
};

const isBlock = (s) => {
  return !isNaN(s) || (typeof(s) === 'string');
};

const isPoS = (b) => {
  return !!b && b.height > params.LAST_POW_BLOCK; // > 182700
};

const isTX = (s) => {
  return typeof(s) === 'string' && s.length === 64;
};

module.exports = {
  avgBlockTime,
  blocksPerDay,
  blocksPerMonth,
  blocksPerWeek,
  blocksPerYear,
  mncoins,
  params,
  getMNBlocksPerDay,
  getMNBlocksPerMonth,
  getMNBlocksPerWeek,
  getMNBlocksPerYear,
  getMNSubsidy,
  getSubsidy,
  getROI,
  isAddress,
  isBlock,
  isPoS,
  isTX
};
