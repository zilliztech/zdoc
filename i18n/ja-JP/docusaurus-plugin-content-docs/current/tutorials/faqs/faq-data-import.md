---
title: "FAQ:データインポート | CLOUD"
slug: /faq-data-import
sidebar_label: "FAQ:データインポート"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloudでデータをインポートする際に発生する可能性のある問題と、それに対応する解決策について説明します。 | CLOUD"
type: origin
token: LKxiwykkhi5VyLkTfAGcE3LinBe
sidebar_position: 4

---

# FAQ:データインポート

このトピックでは、Zilliz Cloudでデータをインポートする際に発生する可能性のある問題と、それに対応する解決策について説明します。

## Contents

- [オブジェクトストレージサービスからデータをインポートする際にセッショントークンを使用できますか?](#can-i-use-session-tokens-when-importing-data-from-an-object-storage-service)
- [Zilliz Cloudベクトルデータベースにデータを一括挿入できますか?](#can-i-bulk-insert-data-into-the-zilliz-cloud-vector-databases)
- [Node. js SDKを使用してZilliz Cloudクラスタにデータをインポートまたはクエリする際にECONNRESETエラーが発生した場合、どうすればよいですか?](#what-can-i-do-if-i-receive-econnreset-errors-when-importing-data-to-or-querying-zilliz-cloud-clusters-with-nodejs-sdk)

## FAQs




### オブジェクトストレージサービスからデータをインポートする際にセッショントークンを使用できますか?{#can-i-use-session-tokens-when-importing-data-from-an-object-storage-service}

はい。データセキュリティ要件に基づいて、オブジェクトストレージサービスからデータをインポートするときにセッショントークンを使用できます。

1. セッショントークンを生成します。

    - Amazon S 3:[AWSリソースで一時的な資格情報を使用する](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html)。

    - Google Cloud Storage:[サービスアカウントの短期間の認証情報を作成する](https://cloud.google.com/iam/docs/create-short-lived-credentials-direct)

    - Azure Blog Storage:[ストレージコンテナ用のSASトークンを作成する](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/create-sas-tokens?view=doc-intel-4.0.0)

1. データのインポート時に、以下のセッショントークン情報を入力してください。

    - Amazon S 3:`accessKeyId`、`secret`AccessKey、`sessionToken`

    - タグ: Google Cloud`Storage`

    - Azure Blog Storage:`Azureブログまとめ`

### Zilliz Cloudベクトルデータベースにデータを一括挿入できますか?{#can-i-bulk-insert-data-into-the-zilliz-cloud-vector-databases}

はい。詳細については、「[データインポート](./data-import)」を参照してください。

### Node. js SDKを使用してZilliz Cloudクラスタにデータをインポートまたはクエリする際にECONNRESETエラーが発生した場合、どうすればよいですか?{#what-can-i-do-if-i-receive-econnreset-errors-when-importing-data-to-or-querying-zilliz-cloud-clusters-with-nodejs-sdk}

この問題を解決するには、以下の手順に従ってください。

1. channelOptionsをサポートするMilvus NodeJS SDKの最新バージョンにアップグレードしてくださ**い**。

1. channelOptionsを手動で追加してください。

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

1. channelOptionsでクライアントを初期化します。

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
