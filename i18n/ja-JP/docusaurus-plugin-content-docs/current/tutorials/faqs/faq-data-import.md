---
title: "FAQ：データインポート | CLOUD"
slug: /faq-data-import
sidebar_label: "FAQ：データインポート"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloudでデータをインポートする際に遭遇する可能性のある問題と、それに対応する解決策をリストアップしています。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 4

---

# FAQ：データインポート

このトピックでは、Zilliz Cloudでデータをインポートする際に遭遇する可能性のある問題と、それに対応する解決策をリストアップしています。

## 目次

- [オブジェクトストレージサービスからデータをインポートする際に短期間の認証情報を使用できますか？](#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service)
- [Zilliz Cloudのベクトルデータベースに一括挿入することはできますか？](#can-i-bulk-insert-data-into-the-zilliz-cloud-vector-databases)
- [Node.js SDKでZilliz CloudクラスターにデータをインポートまたはクエリするときにECONNRESETエラーが発生した場合、どのように対処すればよいですか？](#what-can-i-do-if-i-receive-econnreset-errors-when-importing-data-to-or-querying-zilliz-cloud-clusters-with-nodejs-sdk)

## FAQ

### オブジェクトストレージサービスからデータをインポートする際に短期間の認証情報を使用できますか？\{#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service}

はい。データセキュリティ要件に応じて、オブジェクトストレージサービスからデータをインポートする際にセッショントークンを使用できます。

1. セッショントークンを生成します。

    - Amazon S3: [AWSリソースで一時的な認証情報を使用する](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html)。

    - Google Cloud Storage: [サービスアカウントの短期間の認証情報を作成](https://cloud.google.com/iam/docs/create-short-lived-credentials-direct)

    - Azure Blog Storage: [ストレージコンテナーのSASトークンを作成](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/create-sas-tokens?view=doc-intel-4.0.0)

1. データインポート中に以下のセッショントークン情報を入力します。

    - Amazon S3: `accessKeyId`, `secretAccessKey`, `sessionToken`

    - Google Cloud Storage: `accessToken`

    - Azure Blog Storage: `sasToken`

### Zilliz Cloudのベクトルデータベースに一括挿入することはできますか？\{#can-i-bulk-insert-data-into-the-zilliz-cloud-vector-databases}

はい。詳細については、[データインポート](./data-import)を参照してください。

### Node.js SDKでZilliz CloudクラスターにデータをインポートまたはクエリするときにECONNRESETエラーが発生した場合、どのように対処すればよいですか？\{#what-can-i-do-if-i-receive-econnreset-errors-when-importing-data-to-or-querying-zilliz-cloud-clusters-with-nodejs-sdk}

この問題を解決するには、以下の手順に従ってください。

1. **channelOptions**をサポートする最新バージョンのMilvus NodeJS SDKにアップグレードします。

1. channelOptionsを手動で追加します。

    ```javascript
    const channelOptions: ChannelOptions = {

    // 10秒ごとにキープアライブpingを送信します。デフォルトは2時間です。

    'grpc.keepalive_time_ms': 10 * 1000,

    // 5秒後にキープアライブpingのタイムアウトになります。デフォルトは20秒です。

    'grpc.keepalive_timeout_ms': 5 * 1000,

    // gRPC呼び出しがない場合でもキープアライブpingを許可します。

    'grpc.keepalive_permit_without_calls': 1,

    };
    ```

1. channelOptionsでクライアントを初期化します。

    ```javascript
    import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

    new MilvusClient({
      address: 'your-zilliz-cloud-address',
      ssl: true,
      username: 'username',
      password: 'your-pass',
      channelOptions: channelOptions
    })
    ```