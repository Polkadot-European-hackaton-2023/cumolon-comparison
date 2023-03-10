import {
  Body,
  CacheTTL,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseInterceptors,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { HttpCacheInterceptor } from "src/common/interceptor/HttpCacheInterceptor";
import { CollatorActionHistoryRequest } from "src/viewModel/staking/CollatorActionHistoryRequest";
import { CollatorActionHistoryResponse } from "src/viewModel/staking/CollatorActionHistoryResponse";
import { CollatorProducedBlocksRequest } from "src/viewModel/staking/CollatorProducedBlocksRequest";
import {
  CollatorRewardHistoryRequest,
  CollatorRewardHistoryResponse,
} from "src/viewModel/staking/CollatorRewardHistory";
import { CollatorRewardRequest } from "src/viewModel/staking/CollatorRewardRequest";
import {
  CollatorRewardStatisticRequest,
  CollatorRewardStatisticResponse,
} from "src/viewModel/staking/CollatorRewardStatistic";
import { CollatorsRequest } from "src/viewModel/staking/CollatorsRequest";
import {
  DelegatorActionHistoryRequest,
  DelegatorActionHistoryResponse,
} from "src/viewModel/staking/DelegatorActionHistory";
import {
  DelegatorRewardHistoryRequest,
  DelegatorRewardHistoryResponse,
} from "src/viewModel/staking/DelegatorRewardHistory";
import {
  DelegatorRewardStatisticRequest,
  DelegatorRewardStatisticResponse,
} from "src/viewModel/staking/DelegatorRewardStatistic";
import { NominatorRewardRequest } from "src/viewModel/staking/NominatorRewardRequest";
import { StakeSnapshotRequest } from "src/viewModel/staking/StakeSnapshotRequest";
import {
  StakingPageRequest,
  StakingRequest,
} from "src/viewModel/staking/StakingRequest";

import { StakingBaseService } from "../service/staking-base-service";
import { ServiceManager } from "../../core/service/service-manager";

// import { StakingAnalysisService } from './staking-analysis.service';

@UseInterceptors(HttpCacheInterceptor)
@ApiTags("staking-analysis")
@Controller("parachain/staking")
export class StakingBaseController {
  constructor(private serviceManager: ServiceManager) {}

  proxyService(req: StakingRequest | StakingPageRequest) {
    const id = req.chainId;
    const matched = this.serviceManager.getService<StakingBaseService>(
      id,
      'StakingBaseService'
    );
    if (!matched) {
      throw new Error("not supported chain network");
    }
    return matched;
  }

  @Get("/getLatestBlockNumber")
  @ApiOperation({ summary: "get latest block number;????????????????????????" })
  @ApiOkResponse()
  getLatestBlockNumber(@Query() request: StakingRequest): Promise<number> {
    return this.proxyService(request).getLatestBlockNumber(request.chainId);
  }

  @Get("/getCurrentRoundInfo")
  @ApiOperation({
    summary:
      "get current round info;????????????round???????????? ??????roundIndex, ????????????????????? ????????????",
  })
  @ApiOkResponse()
  getCurrentRoundInfo(@Query() request: StakingRequest): Promise<number> {
    return this.proxyService(request).getCurrentRoundInfo(request.chainId);
  }

  @Get("/getMaxNominatorsPerCollator")
  @ApiOperation({
    summary:
      "get max nominators count for each collator;????????????Collator???????????????nominator??????",
  })
  @ApiOkResponse()
  getMaxNominatorsPerCollator(
    @Query() request: StakingRequest
  ): Promise<number> {
    return this.proxyService(request).getMaxNominatorsPerCollator(
      request.chainId
    );
  }

  @Get("/getRealtimeCollatorCandidatePool")
  @ApiOperation({
    summary:
      "get all collator candidates in realtime;???????????????collator????????????????????????????????????collator?????????????????????????????????????????????????????? collator???????????????",
  })
  @ApiOkResponse()
  getRealtimeCollatorCandidatePool(
    @Query() request: StakingRequest
  ): Promise<number> {
    return this.proxyService(request).getRealtimeCollatorCandidatePool(
      request.chainId
    );
  }

  @Get("/getSelectedCollators4CurrentRound")
  @ApiOperation({
    summary:
      "get selected collators when the round start;???????????????round??????????????????????????????????????????collator????????????",
  })
  @ApiOkResponse()
  getSelectedCollators4CurrentRound(
    @Query() request: StakingRequest
  ): Promise<number> {
    return this.proxyService(request).getSelectedCollators4CurrentRound(
      request.chainId
    );
  }

  @Post("/getRealtimeCollatorState")
  @ApiOperation({
    summary:
      "get all states include collators and nominators in realtime;???????????????collator???nominator??????????????????????????????????????????????????????????????? ??????????????????collator???????????? nominator?????????",
  })
  @ApiOkResponse()
  getRealtimeCollatorState(@Body() request: CollatorsRequest): Promise<number> {
    let collatorAccounts = request.collators;
    return this.proxyService(request).getRealtimeCollatorState(
      request.chainId,
      collatorAccounts
    );
  }

  // @Get('/getScheduledExitQueue')
  // @ApiOperation({ summary: 'get the scheduled exit of collators/nominators;??????????????????????????????collator?????????nominator????????????????????????????????? ?????????????????????roundIndex??????????????????????????????????????????round??????????????? ??????????????????roundIndex????????? ?????????????????????????????????' })
  // @ApiOkResponse()
  // getScheduledExitQueue(@Body() request): Promise<number> {
  //   return this.proxyService(request).getScheduledExitQueue();
  // }

  @CacheTTL(60)
  @Get("/getMaxCollatorsPerRound")
  @ApiOperation({
    summary:
      "get max collators count per round;????????????round?????????collator??????",
  })
  @ApiOkResponse()
  getMaxCollatorsPerRound(@Query() request: StakingRequest): Promise<number> {
    return this.proxyService(request).getMaxCollatorsPerRound(request);
  }

  @CacheTTL(60)
  @Post("/getNominatorReward")
  @ApiOperation({
    summary:
      "//get reward statistic for a range of round index;?????????????????????roundIndex???reward????????????, ??????:??????nominator???reward??????????????????collator??????",
  })
  @ApiOkResponse()
  getNominatorReward(@Body() request: NominatorRewardRequest): Promise<any> {
    return this.proxyService(request).getNominatorReward(request);
  }

  @CacheTTL(60)
  @Post("/getDelegatorRewardStatistic")
  @ApiOperation({
    summary:
      "//get reward statistic of delegator;??????delegator???reward????????????",
  })
  @ApiOkResponse({ type: DelegatorRewardStatisticResponse })
  getDelegatorRewardStatistic(
    @Body() request: DelegatorRewardStatisticRequest
  ): Promise<DelegatorRewardStatisticResponse> {
    return this.proxyService(request).getDelegatorRewardStatistic(request);
  }

  @CacheTTL(60)
  @Post("/getCollatorRewardStatistic")
  @ApiOperation({
    summary: "//get reward statistic of Collator;??????Collator???reward????????????",
  })
  @ApiOkResponse({ type: CollatorRewardStatisticResponse })
  getCollatorRewardStatistic(
    @Body() request: CollatorRewardStatisticRequest
  ): Promise<CollatorRewardStatisticResponse> {
    return this.proxyService(request).getCollatorRewardStatistic(request);
  }

  @CacheTTL(60)
  @Post("/getCollatorReward")
  @ApiOperation({
    summary:
      "//get reward statistic for a range of round index;?????????????????????roundIndex???reward????????????",
  })
  @ApiOkResponse()
  getHistoryReward(@Body() request: CollatorRewardRequest): Promise<any> {
    return this.proxyService(request).getCollatorReward(request);
  }
  @CacheTTL(60)
  @Post("/getCollatorProducedBlocks")
  @ApiOperation({
    summary:
      "//get produced blocks count for a range of round index;?????????????????????roundIndex????????????Blocks????????????",
  })
  @ApiOkResponse()
  getCollatorProducedBlocks(
    @Body() request: CollatorProducedBlocksRequest
  ): Promise<any> {
    return this.proxyService(request).getCollatorProducedBlocks(request);
  }

  @CacheTTL(60)
  @Post("/getCollatorTotalReward")
  @ApiOperation({
    summary:
      "//get total reward statistic of the specified collators;??????collator?????????reward??????",
  })
  @ApiOkResponse()
  getCollatorTotalReward(@Body() request: CollatorsRequest): Promise<any> {
    return this.proxyService(request).getCollatorTotalReward(request);
  }

  @CacheTTL(60)
  @Post("/atStake")
  @ApiOperation({
    summary:
      "//get the stake summary info for the specified roundIndex, include collator stake, nominator stake;????????????roundIndex???stake???????????????collator stake, nominator stake???",
  })
  @ApiOkResponse()
  getStake(@Body() request: StakeSnapshotRequest): Promise<any> {
    return this.proxyService(request).atStake(request);
  }

  @CacheTTL(60)
  @Post("/getCollatorActionHistory")
  @ApiOperation({
    summary:
      "//get all action history of the specified collator;??????collator?????????????????????",
  })
  @ApiOkResponse({ type: CollatorActionHistoryResponse })
  getCollatorActionHistory(
    @Body() request: CollatorActionHistoryRequest
  ): Promise<CollatorActionHistoryResponse> {
    return this.proxyService(request).getCollatorActionHistory(request);
  }

  @CacheTTL(60)
  @Post("/getCollatorRewardHistory")
  @ApiOperation({
    summary:
      "//get all reward history of the specified collator;??????collator?????????Reward??????",
  })
  @ApiOkResponse({ type: CollatorRewardHistoryResponse })
  getCollatorRewardHistory(
    @Body() request: CollatorRewardHistoryRequest
  ): Promise<CollatorRewardHistoryResponse> {
    return this.proxyService(request).getCollatorRewardHistory(request);
  }

  @CacheTTL(60)
  @Post("/getDelegatorActionHistory")
  @ApiOperation({
    summary:
      "//get all action history of the specified delagator;??????Delegator?????????????????????",
  })
  @ApiOkResponse({ type: DelegatorActionHistoryResponse })
  getDelegatorActionHistory(
    @Body() request: DelegatorActionHistoryRequest
  ): Promise<DelegatorActionHistoryResponse> {
    return this.proxyService(request).getDelegatorActionHistory(request);
  }

  @CacheTTL(60)
  @Post("/getDelegatorRewardHistory")
  @ApiOperation({
    summary:
      "//get all reward detail history of the specified collator;??????Delegator?????????Reward??????",
  })
  @ApiOkResponse({ type: DelegatorRewardHistoryResponse })
  getDelegatorRewardHistory(
    @Body() request: DelegatorRewardHistoryRequest
  ): Promise<DelegatorRewardHistoryResponse> {
    return this.proxyService(request).getDelegatorRewardHistory(request);
  }
}
