<template>
  <a-modal
    :width="550"
    modal-class="layout-connet-wallet-modal"
    v-model:visible="visible"
    :footer="false"
  >
    <div class="modal-content">
      <div class="close" @click="visible = false">
        <icon-close />
      </div>
      <div class="m-title">
        {{ ifSwitch ? "Manage Accounts" : "Connect Wallet" }}
      </div>
      <div v-if="!ifSwitch" class="sub-title">
        {{ subTitle }}
      </div>
      <div class="wallet-type-list">
        <div class="item-wrap">
          <div class="item">
            <div class="circle">
              <img
                class="icon metamask"
                src="@/assets/images/home/metamask.png"
                alt=""
              />
            </div>
            <div class="i-center">
              <div class="name">
                {{
                  $store.state.global.metamaskWallet.address
                    ? "Account"
                    : "Metamask"
                }}
              </div>
              <div class="des">
                <a-tooltip
                  v-if="$store.state.global.metamaskWallet.address"
                  :content="$store.state.global.metamaskWallet.address"
                >
                  <span>{{
                    $utils.shorterAddress(
                      $store.state.global.metamaskWallet.address
                    )
                  }}</span>
                </a-tooltip>
                <span v-else
                  >Connect to stake on below chains</span
                >
              </div>
              <div class="icon-list">
                <a-tooltip
                  v-for="(v, i) in metamaskChainList"
                  :key="i"
                  :content="v.name"
                >
                  <div class="il-circle">
                    <img :src="v.icon" alt="" />
                  </div>
                </a-tooltip>
              </div>
            </div>
            <a-button
              v-if="!$store.state.global.metamaskWallet.address"
              :loading="metamaskLinkLoading"
              class="btn"
              type="primary"
              @click="connectMetamask"
            >
              {{ metamaskLinkLoading ? "" : "Connect" }}
            </a-button>
            <a-dropdown v-else @select="disconnectMetamask">
              <div class="dropdown-btn">
                <span>Connected</span>
                <icon-down />
              </div>
              <template #content>
                <a-doption>Disconnect</a-doption>
              </template>
            </a-dropdown>
          </div>
        </div>
        <div class="item-wrap">
          <div class="item">
            <div class="circle">
              <img
                class="icon polkadot"
                src="@/assets/images/home/polkadot.png"
                alt=""
              />
            </div>
            <div class="i-center">
              <div class="name">
                <span>
                  {{
                    $store.getters.polkadotWalletTransformAddress
                      ? $store.state.global.polkadotWallet.meta.name
                      : "Polkadot.js"
                  }}
                </span>
                <img
                  v-if="$store.getters.polkadotWalletTransformAddress"
                  @click="handleSwitchWallet"
                  class="hover-item"
                  src="@/assets/images/home/compare_arrows.png"
                  alt=""
                />
              </div>
              <div class="des">
                <a-tooltip
                  v-if="$store.getters.polkadotWalletTransformAddress"
                  :content="$store.getters.polkadotWalletTransformAddress"
                >
                  <span>{{
                    $utils.shorterAddress(
                      $store.getters.polkadotWalletTransformAddress
                    )
                  }}</span>
                </a-tooltip>
                <span v-else>Connect to stake on below chains</span>
              </div>
              <div class="icon-list">
                <a-tooltip
                  v-for="(v, i) in polkadotChainList"
                  :key="i"
                  :content="v.name"
                >
                  <div class="il-circle">
                    <img :src="v.icon" alt="" />
                  </div>
                </a-tooltip>
              </div>
            </div>
            <a-button
              v-if="!$store.getters.polkadotWalletTransformAddress"
              :loading="polkadotLinkLoading"
              class="btn"
              type="primary"
              @click="connectPolkadot"
            >
              {{ polkadotLinkLoading ? "" : "Connect" }}
            </a-button>
            <a-dropdown v-else @select="disconnectPolkadot">
              <div class="dropdown-btn">
                <span>Connected</span>
                <icon-down />
              </div>
              <template #content>
                <a-doption>Disconnect</a-doption>
              </template>
            </a-dropdown>
          </div>
          <div v-if="showAccountList" class="item-account-list">
            <div
              class="i-item"
              :class="{ active: accountActive(v) }"
              @click="switchPolkadotAccount(v)"
              v-for="(v, i) in $store.state.global.polkadotWalletList"
              :key="i"
            >
              <div class="headicon">
                <IdentityIcon
                  :iconSize="24"
                  type="polkadot"
                  :address="v.address"
                />
              </div>
              <div class="right">
                <div class="name ellipsis" title="Account-01">
                  {{ v.meta.name }}
                </div>
                <div class="address">
                  {{ $utils.shorterAddress(v.address) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>
import { ApiPromise, WsProvider } from "@polkadot/api";
import { mapState } from "vuex";
import { ethers, utils } from "ethers";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import IdentityIcon from "@/components/IdentityIcon";
import { BigNumber } from "bignumber.js";
export default {
  components: {
    IdentityIcon,
  },
  data() {
    return {
      ifSwitch: false,
      visible: false,
      metamaskLinkLoading: false,
      polkadotLinkLoading: false,
      showAccountList: false,
    };
  },
  created() {
    if (
      this.$store.getters.polkadotWalletTransformAddress ||
      this.$store.state.global.metamaskWallet.address
    ) {
      this.updateSupportWalletFreeBalance();
    }
    this.$eventBus.on(
      "updateSupportWalletFreeBalance",
      this.updateSupportWalletFreeBalance
    );
  },
  computed: {
    subTitle() {
      if (
        !this.$store.getters.ifLogin ||
        !this.$store.state.global.currentChain.network
      ) {
        return "Connect Wallet to start your staking journey";
      }

      if (
        this.$utils.ifSupportPolkadot(
          this.$store.state.global.currentChain.network
        ) &&
        !this.$store.getters.polkadotWalletTransformAddress
      ) {
        return "Current network does not support Metamask. Please connect Polkadot.js.";
      }
      if (
        !this.$utils.ifSupportPolkadot(
          this.$store.state.global.currentChain.network
        ) &&
        !this.$store.state.global.metamaskWallet.address
      ) {
        return "Current network does not support Polkadot.js. Please connect Metamask.";
      }
    },
    metamaskChainList() {
      return this.$store.state.global.supportChainList.filter(
        (v) => !this.$utils.ifSupportPolkadot(v.network)
      );
    },
    polkadotChainList() {
      return this.$store.state.global.supportChainList.filter((v) =>
        this.$utils.ifSupportPolkadot(v.network)
      );
    },
  },
  methods: {
    accountActive(v) {
      return v.address == this.$store.getters.polkadotWalletTransformAddress;
    },
    init(ifSwitch) {
      this.ifSwitch = ifSwitch ? true : false;
      this.visible = true;
    },
    async getPolkadotBalance(parachainObj) {
      const address = this.$store.getters.polkadotWalletTransformAddress;
      if (!address) {
        return 0;
      }
      const wsProvider = new WsProvider(parachainObj.wssEndpoints);
      const api = await ApiPromise.create({
        provider: wsProvider,
      });
      const accountInfo = await api.query.system.account(address);
      let free = 0;
      if (accountInfo && accountInfo.data) {
        const _free = accountInfo.data.free.toString(10);
        const miscFrozen = accountInfo.data.miscFrozen.toString(10);
        free = BigNumber(_free - miscFrozen).dividedBy(
          new BigNumber("1e" + parachainObj.decimals[0])
        );
      }
      let copySupportChainList = JSON.parse(
        JSON.stringify(this.$store.state.global.supportChainList)
      );
      const findIndex = copySupportChainList.findIndex(
        (sv) => sv.network == parachainObj.network
      );
      copySupportChainList[findIndex].free = free;
      this.$store.commit("changeSupportChainList", copySupportChainList);
    },
    async getMetamaskBalance(parachainObj) {
      const address = this.$store.state.global.metamaskWallet.address;
      if (!address) {
        return 0;
      }
      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      let provider;
      if (parachainObj.wssEndpoints[0].includes("wss://")) {
        provider = new ethers.providers.WebSocketProvider(
          parachainObj.wssEndpoints[0]
        );
      } else {
        provider = new ethers.providers.JsonRpcProvider(
          parachainObj.wssEndpoints[0]
        );
      }
      const b = await provider.getBalance(address);
      const _free = ethers.utils.formatUnits(b, parachainObj.decimals[0]);
      const free = new BigNumber(_free);
      // const free = b
      //   .dividedBy(new BigNumber("1e" + parachainObj.decimals[0]))
      //   .toFixed(2);
      let copySupportChainList = JSON.parse(
        JSON.stringify(this.$store.state.global.supportChainList)
      );
      const findIndex = copySupportChainList.findIndex(
        (sv) => sv.network == parachainObj.network
      );
      copySupportChainList[findIndex].free = free;
      this.$store.commit("changeSupportChainList", copySupportChainList);
    },
    updateSupportWalletFreeBalance() {
      let newsupportChainList = JSON.parse(
        JSON.stringify(this.$store.state.global.supportChainList)
      );
      newsupportChainList.forEach((v) => {
        v.free = undefined;
      });
      this.$store.commit("changeSupportChainList", newsupportChainList);

      for (const v of newsupportChainList) {
        if (!this.$utils.ifSupportPolkadot(v.network)) {
          this.getMetamaskBalance(v);
        } else {
          this.getPolkadotBalance(v);
        }
      }
    },
    connectMetamask() {
      this.metamaskLinkLoading = true;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider
        .send("eth_requestAccounts", [])
        .then(async (accs) => {
          if (accs && accs.length > 0) {
            this.$store.commit("changeMetamaskWallet", {
              address: utils.getAddress(accs[0]),
            });
            this.metamaskLinkLoading = false;
            this.updateSupportWalletFreeBalance();
          }
        })
        .catch(() => {
          this.metamaskLinkLoading = false;
          console.log("user rejected request");
        });
    },
    async connectPolkadot() {
      this.polkadotLinkLoading = true;
      let isLinked = false;
      await web3Enable(`Go Staking`).then((injectedExtensions) => {
        isLinked = injectedExtensions && injectedExtensions.length > 0;
      });
      if (!isLinked) {
        this.polkadotLinkLoading = false;
        this.$message.error(
          "We couldn't connect to wallet, please check the extension and try again."
        );
        return;
      }
      const allAccounts = await web3Accounts({
        accountType: ["ed25519", "sr25519", "ecdsa"],
      });
      console.log("allAccounts", allAccounts);
      this.$store.commit("changePolkadotWalletList", allAccounts);
      this.showAccountList = true;
      this.polkadotLinkLoading = false;
    },
    handleSwitchWallet() {
      this.showAccountList = true;
    },
    async switchPolkadotAccount(v) {
      this.$store.commit("changePolkadotWallet", v);
      this.showAccountList = false;
      this.updateSupportWalletFreeBalance();
    },
    disconnectMetamask() {
      this.$store.commit("changeMetamaskWallet", {});
      this.updateSupportWalletFreeBalance();
    },
    disconnectPolkadot() {
      this.$store.commit("changePolkadotWallet", {});
      this.$store.commit("changePolkadotWalletList", []);
      this.updateSupportWalletFreeBalance();
    },
  },
};
</script>

<style lang="less">
.layout-connet-wallet-modal {
  background: #ffffff;
  box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08);
  border-radius: 30px;
  .arco-modal-header {
    display: none;
  }
  .arco-modal-body {
    padding: 0;
    position: relative;
  }
  .modal-content {
    padding: 46px 32px;
    .close {
      width: 24px;
      height: 24px;
      background: #f4f7fe;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: absolute;
      top: 24px;
      right: 24px;
      &:hover {
        svg {
          color: #4318ff;
        }
      }
    }
    .m-title {
      text-align: center;
      font-weight: 700;
      font-size: 36px;
      line-height: 56px;
      letter-spacing: -0.02em;
      color: #2b3674;
    }
    .sub-title {
      text-align: center;
      font-weight: 400;
      font-size: 16px;
      line-height: 26px;
      color: #a3aed0;
    }
    .wallet-type-list {
      padding-top: 24px;
      .item-wrap {
        & + .item-wrap {
          margin-top: 16px;
        }
      }
      .item {
        position: relative;
        background: #ffffff;
        border: 1px solid #e0e5f2;
        border-radius: 12px;
        display: flex;
        padding: 10px;
        align-items: center;

        .circle {
          margin-bottom: 30px;
          width: 40px;
          height: 40px;
          background: #f4f7fe;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
          .metamask {
            width: 24px;
          }
          .polkadot {
            width: 19px;
          }
        }
        .i-center {
          flex: 1;
          .name {
            font-weight: 400;
            font-size: 16px;
            line-height: 24px;
            color: #47548c;
            display: flex;
            align-items: center;
            img {
              width: 24px;
              margin-left: 4px;
            }
          }
          .des {
            font-weight: 400;
            font-size: 12px;
            line-height: 20px;
            color: #a3aed0;
          }
          .icon-list {
            margin-top: 6px;
            display: flex;
            align-items: center;
            .il-circle {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 1px solid #d9d9d9;
              background: white;
              display: flex;
              justify-content: center;
              align-items: center;
              & + .il-circle {
                margin-left: -4px;
              }
              img {
                max-width: 16px;
                max-height: 16px;
              }
            }
          }
        }
        .btn {
          width: 90px;
          height: 40px;
          &.arco-btn-loading {
            .arco-btn-icon {
              margin-right: 0;
            }
          }
        }
        .dropdown-btn {
          height: 40px;
          line-height: 40px;
          font-weight: 500;
          font-size: 14px;
          letter-spacing: -0.02em;
          cursor: pointer;
          color: #4318ff;
          &:hover {
            opacity: 0.8;
          }
          svg {
            margin-left: 4px;
          }
        }
      }
      .item-account-list {
        box-sizing: border-box;
        padding: 45px 11px 16px 11px;
        width: 100%;
        background: #f4f7fe;
        border-radius: 0px 0px 12px 12px;
        margin-top: -30px;
        display: grid;
        grid-template-columns: repeat(3, 144px);
        grid-gap: 16px;
        .i-item {
          cursor: pointer;
          border: 1px solid #e0e5f2;
          border-radius: 12px;
          display: flex;
          align-items: flex-start;
          padding: 12px;
          &.active {
            border-color: #4318ff;
          }
          &:hover {
            border-color: #4318ff;
          }
          .headicon {
            margin-right: 8px;
          }
          .right {
            .name {
              font-weight: 600;
              font-size: 14px;
              line-height: 22px;
              color: #707eae;
              width: 89px;
            }
            .address {
              margin-top: 3px;
              font-weight: 400;
              font-size: 12px;
              line-height: 20px;
              color: #a3aed0;
            }
          }
        }
      }
    }
  }
}
</style>