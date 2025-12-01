---
title: "FAQ: データインポート | BYOC"
slug: /faq-data-import
sidebar_label: "FAQ: データインポート"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudでデータをインポートする際に遭遇する可能性のある問題とその解決方法についてこのトピックで紹介します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 4

---

# FAQ: データインポート

このトピックでは、Zilliz Cloudでデータをインポートする際に遭遇する可能性のある問題とその解決方法について紹介します。

## 目次

- [オブジェクトストレージサービスからデータをインポートする際に短期間の認証情報を使用できますか？](#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service)
- [Zilliz Cloudのベクターデータベースにデータを一括挿入できますか？](#can-i-bulk-insert-data-into-the-zilliz-cloud-vector-databases)
- [Node.js SDKを使用してZilliz Cloudクラスターにデータをインポートまたはクエリする際にECONNRESETエラーを受け取った場合、どうすればよいですか？](#what-can-i-do-if-i-receive-econnreset-errors-when-importing-data-to-or-querying-zilliz-cloud-clusters-with-nodejs-sdk)

## よくある質問




### オブジェクトストレージサービスからデータをインポートする際に短期間の認証情報を使用できますか？\{#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service}

はい。データセキュリティの要件に応じて、オブジェクトストレージサービスからデータをインポートする際にセッショントークンを使用できます。

1. セッショントークンを生成します。

    - Amazon S3: [AWSリソースでの一時認証情報の使用](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html)。

    - Google Cloud Storage: [サービスアカウントの短期間認証情報を作成](https://cloud.google.com/iam/docs/create-short-lived-credentials-direct)

    - Azure Blog Storage: [ストレージコンテナーのSASトークンを作成](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/create-sas-tokens?view=doc-intel-4.0.0)

2. データインポート中に以下のセッショントークン情報を入力します。

    - Amazon S3: `accessKeyId`, `secretAccessKey`, `sessionToken`

    - Google Cloud Storage: `accessToken`

    - Azure Blog Storage: `sasToken`

### Zilliz Cloudのベクターデータベースにデータを一括挿入できますか？\{#can-i-bulk-insert-data-into-the-zilliz-cloud-vector-databases}

はい。詳細については、[データインポート](./data-import)を参照してください。

### Node.js SDKを使用してZilliz Cloudクラスターにデータをインポートまたはクエリする際にECONNRESETエラーを受け取った場合、どうすればよいですか？\{#what-can-i-do-if-i-receive-econnreset-errors-when-importing-data-to-or-querying-zilliz-cloud-clusters-with-nodejs-sdk}

この問題を解決するには、以下の手順に従ってください。

1. **channelOptions**をサポートする最新バージョンのMilvus NodeJS SDKにアップグレードしてください。

2. channelOptionsを手動で追加します。

    ```javascript
    const channelOptions: ChannelOptions = {

    // 10秒ごとにkeepalive pingを送信します。デフォルトは2時間です。

    'grpc.keepalive_time_ms': 10 * 1000,

    // 5秒後にkeepalive pingタイムアウトします。デフォルトは20秒です。

    'grpc.keepalive_timeout_ms': 5 * 1000,

    // gRPC呼び出しがない場合でもkeepalive pingを許可します。

    'grpc.keepalive_permit_without_calls': 1,

    };
    ```

3. channelOptionsでクライアントを初期化します。

    ```javascript
    import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

    new MilvusClient({
      address: 'your-zilliz-cloud-address',
      ssl: true,
      username: 'username',
      password: 'your-pass',
      channelOptions: channel options
    })
    ```
