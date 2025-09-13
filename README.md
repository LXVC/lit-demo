## 运行方式

```
npm i
npm start
```


## 文件说明
```
src/
├── actions/
│   └── lit-action.js  (用于加解密逻辑的 lit action， 已部署到 IPFS)
├── components/
│   ├── DataRetrieval.tsx（解密读取组件）
│   ├── DataStorage.tsx（加密存储组件）
│   └── WalletConnector.tsx（连接钱包组件）
├── hooks/
│   └── useLitClient.ts（连接 lit network hook）
├── types/
│   └── index.ts（自定义类型）
└── utils/
    ├── litActions.ts（与 lit action 的逻辑交互）
    └── litSession.ts（生成 SessionSigs，用于支持与 lit action 的交互）
```