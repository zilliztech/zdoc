---
title: "FAQ: データインポート | CLOUD"
slug: /faq-data-import
sidebar_label: "FAQ: データインポート"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud でデータをインポートする際に発生する可能性のある問題と、それに対応する解決策を一覧表示します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 4
displayed_sidebar: default

---

# FAQ: データインポート

このトピックでは、Zilliz Cloud でデータをインポートする際に発生する可能性のある問題と、それに対応する解決策を一覧表示します。

## 目次

- [オブジェクトストレージサービスからデータをインポートする際に短期認証情報を使用できますか？](#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service)
- [Zilliz Cloud ベクトルデータベースにデータを一括挿入できますか？](#can-i-bulk-insert-data-into-the-zilliz-cloud-vector-databases)
- [Node.js SDK を使用して Zilliz Cloud クラスターにデータをインポートしたりクエリしたりする際に ECONNRESET エラーが発生した場合はどうすればよいですか？](#what-can-i-do-if-i-receive-econnreset-errors-when-importing-data-to-or-querying-zilliz-cloud-clusters-with-nodejs-sdk)

## FAQ




### オブジェクトストレージサービスからデータをインポートする際に短期認証情報を使用できますか？\{#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service}

はい。データセキュリティ要件に応じて、オブジェクトストレージサービスからデータをインポートする際にセッショントークンを使用できます。 

1. セッショントークンを生成します。

    - Amazon S3: [AWS リソースで一時的な認証情報を使用する](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html).

    - Google Cloud Storage: [サービスアカウント用の短期間有効な認証情報を作成する](https://cloud.google.com/iam/docs/create-short-lived-credentials-direct)

    - Azure Blog Storage: [ストレージコンテナー用の SAS トークンを作成する](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/create-sas-tokens?view=doc-intel-4.0.0)

1. データインポート時に次のセッショントークン情報を入力します。

    - Amazon S3: `accessKeyId`, `secretAccessKey`, `sessionToken`

    - Google Cloud Storage: `accessToken`

    - Azure Blog Storage: `sasToken`

### Zilliz Cloud ベクトルデータベースにデータを一括挿入できますか？\{#can-i-bulk-insert-data-into-the-zilliz-cloud-vector-databases}

はい。詳細については、[Import](./zilliz-import-prompts) を参照してください。

### Node.js SDK を使用して Zilliz Cloud クラスターにデータをインポートしたりクエリしたりする際に ECONNRESET エラーが発生した場合はどうすればよいですか？\{#what-can-i-do-if-i-receive-econnreset-errors-when-importing-data-to-or-querying-zilliz-cloud-clusters-with-nodejs-sdk}

この問題を解決するには、以下の手順に従ってください。

1. **channelOptions** をサポートする最新バージョンの Milvus NodeJS SDK にアップグレードします。

1. channelOptions を手動で追加します。

    ```javascript
    const channelOptions: ChannelOptions = {
    
    // Send keepalive pings every 10 seconds, default is 2 hours.
    
    'grpc.keepalive_time_ms': 10 * 1000,
    
    // Keepalive ping timeout after 5 seconds, default is 20 seconds.
    
    'grpc.keepalive_timeout_ms': 5 * 1000,
    
    // Allow keepalive pings when there are no gRPC calls.
    
    'grpc.keepalive_permit_without_calls': 1,
    
    };
    ```

1. channelOptions を使用してクライアントを初期化します。

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
