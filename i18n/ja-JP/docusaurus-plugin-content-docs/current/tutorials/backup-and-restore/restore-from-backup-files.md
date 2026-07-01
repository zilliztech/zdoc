---
title: "バックアップファイルからの復元 | Cloud"
slug: /restore-from-backup-files
sidebar_key: restore-from-backup-files
sidebar_label: "バックアップファイルから復元"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud の復元機能を使用すると、誤ったデータの消失や破損、システム障害などの事態からバックアップファイルを用いてデータを復旧でき、ビジネスの継続性を確保します。インシデントからの復旧、意図しない変更の巻き戻し、テスト用のクラスター複製などを最小限の影響で実現する信頼性の高い方法です。"
type: origin
token: Dd6jwYIGiiz6HWkEPJqcpMA3n6g
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - バックアップ
  - 復元

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップファイルからの復元

Zilliz Cloud の復元機能を使用すると、誤ったデータの消失や破損、システム障害などの場合にバックアップファイルからデータを復旧でき、ビジネスの継続性を確保できます。これは、インシデントからの復旧、意図しない変更の巻き戻し、または最小限の中断でテスト用にクラスターをクローンするための信頼性の高い方法です。

このガイドでは、バックアップファイルからクラスター全体または一部を復元する方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

この機能は **Dedicated** クラスターでのみ利用可能です。

</Admonition>

## 制限\{#limits}

- **アクセス制御**: プロジェクト管理者、組織オーナー、またはバックアップ権限を持つカスタムロールである必要があります。

## クラスター全体の復元\{#restore-a-full-cluster}

すべてのデータベースとコレクションを含むクラスター全体を、**新しい**クラスターに復元できます。これは、テストや復旧のために環境をクローンする場合に便利です。クラスター全体を復元するには、バックアップファイルがクラスターバックアップである必要があります。

復元中に、次の項目も設定できます。

- RBAC 設定を含めるかどうかを選択します。

- 復元後に作成される新しいクラスターの Milvus バージョンを選択します。

    - 過去 30 日以内に作成されたバックアップファイルで、元のクラスターが利用可能な最新の Milvus GA バージョンより前の GA バージョンを使用していた場合、復元後のクラスターで使用する Milvus バージョンを選択できます。デフォルトでは、Zilliz Cloud は最新の GA Milvus バージョンに復元します。

    - 30 日より前に作成されたバックアップファイル、またはすでに最新の Milvus GA バージョンを使用しているバックアップファイルでは、ターゲット Milvus バージョンを変更できません。

    たとえば、利用可能な最新の Milvus GA バージョンが 2.6.x であるとします。

    - 過去 30 日以内に作成された 2.5.x のバックアップファイルから復元する場合、Zilliz Cloud はデフォルトで新しいクラスターを 2.6.x に復元しますが、2.5.x に復元するよう選択できます。

    - 30 日より前に作成された 2.5.x のバックアップファイルから復元する場合、Zilliz Cloud はデフォルトで新しいクラスターを 2.6.x に復元し、ターゲット Milvus バージョンは変更できません。

    - 2.6.x のバックアップファイルから復元する場合、Zilliz Cloud は新しいクラスターを 2.6.x に復元し、ターゲット Milvus バージョンは変更できません。

- CMEK による保存時暗号化を有効にするかどうかを選択します。詳細については、[カスタマー管理暗号化キー](./cmek)を参照してください。

復元後、`db_admin` ユーザー用に**新しいパスワード**が生成されます。このパスワードを使用して、復元されたクラスターに接続してください。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloud ウェブコンソールでクラスター全体を復元する方法を示しています。

<Supademo id="cmcsruzjd0gyo9st8kcjye30i" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、既存のバックアップファイルから `Dedicated-01-backup` という名前の新しいクラスターにクラスター全体を復元します。RESTful API の詳細については、[クラスターバックアップの復元](/reference/restful/restore-cluster-backup-v2) を参照してください。

```bash
export API_KEY="YOUR_API_KEY"
export BASE_URL="https://api.cloud.zilliz.com"
export CLUSTER_ID="your-cluster-id"

curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/restoreCluster" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json" \
     --data-raw '{
        "targetProjectId": "proj-20e13e974c7d659a83xxxx",
        "clusterName": "Dedicated-01-backup",
        "cuSize": 1,
        "collectionStatus": "KEEP",
        "restoreVersionPolicy": "ORIGINAL"
      }'
```

次の表は、各パラメーターについて説明しています。

<table>
   <tr>
     <th><p><strong>パラメーター</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p><code>targetProjectId</code></p></td>
     <td><p>復元後のクラスターを作成するターゲットプロジェクトの ID。</p></td>
   </tr>
   <tr>
     <td><p><code>clusterName</code></p></td>
     <td><p>復元後のクラスター名。</p></td>
   </tr>
   <tr>
     <td><p><code>cuSize</code></p></td>
     <td><p>復元後のクラスターのクエリ CU サイズ。</p></td>
   </tr>
   <tr>
     <td><p><code>collectionStatus</code></p></td>
     <td><p>復元後にコレクションのロード状態を保持するかどうか。使用可能なオプションは次のとおりです。</p><ul><li><p><code>KEEP</code>: 元のコレクション状態を保持します。</p></li><li><p><code>RELEASE</code>: すべてのコレクションを解放します。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>restoreVersionPolicy</code></p></td>
     <td><p>復元後のクラスターで使用する互換 Milvus バージョン。使用可能なオプションは次のとおりです。</p><ul><li><p><code>ORIGINAL</code>: クラスターを元の互換 Milvus バージョンに復元します。</p></li><li><p><code>LATEST</code>: 利用可能な最新の GA Milvus バージョンに復元します。</p></li></ul></td>
   </tr>
</table>

復元ジョブが生成され、進捗状況は [プロジェクトジョブセンター](./job-center) で確認できます。

```bash
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "username": "db_admin",
    "password": "xxxxxxxxx",
    "jobId": "job-xxxxxxxxxxxxxx"
  }
}
```

## クラスタの一部を復元する\{#restore-a-partial-cluster}

特定のデータベースとコレクションのみを**既存のクラスタ**に復元することも選択できます。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloud ウェブコンソールでクラスタ内の特定のデータベースとコレクションを復元する方法を示しています。

<Supademo id="cmcss7xi00h8c9st8qsqnutnn" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、バックアップファイルからコレクションを既存のクラスタ `in01-3e5ad8adc38xxxx` に復元します。RESTful API の詳細については、[コレクションバックアップの復元](/reference/restful/restore-collection-backup-v2) を参照してください。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/restoreCollection" \
--header "Authorization: Bearer ${API_KEY}" \
--header "Content-Type: application/json" \
-d '{
    "destClusterId": "in01-xxxxxxxxxxxxxx",
    "dbCollections": [
        {
            "collections": [
                {
                    "collectionName": "medium_articles",
                    "destCollectionName": "restore_medium_articles",
                    "destCollectionStatus": "LOADED"
                }
            ]
        }
    ]
}'
```

復元ジョブが生成され、進捗状況は [プロジェクトジョブセンター](./job-center) で確認できます。

```bash
{
  "code": 0,
  "data": {
    "jobId": "job-04bf9335838dzkeydpxxxx"
  }
}
```

## 暗号化バックアップファイルからの復元\{#restore-from-an-encrypted-backup-file}

暗号化されたバックアップを新しいクラスターに復元する場合、Zilliz Cloud はバックアップファイルに関連付けられた KMS キーを使用して、復元前にデータを復号化します。そのため、暗号化の有無に関わらず、バックアップを新しいクラスターに復元できます。

<Admonition type="info" icon="📘" title="Notes">

この機能は、**ビジネスクリティカル** プロジェクトの **Dedicated** クラスターでのみ利用可能です。

</Admonition>

![WaApbDlaYoywaMxxUMxcQLAOnDe](https://zdoc-images.s3.us-west-2.amazonaws.com/waapbdlayoywamxxumxcqlaonde.png "WaApbDlaYoywaMxxUMxcQLAOnDe")

暗号化されたバックアップからの復元手順は、通常の復元とほぼ同じですが、**CMEK を使用した保存時の暗号化** を有効にするかどうかが異なります。

![V1QJb3SK1oGa11xLljhcxKQEnkc](https://zdoc-images.s3.us-west-2.amazonaws.com/v1qjb3sk1oga11xlljhcxkqenkc.png "V1QJb3SK1oGa11xLljhcxKQEnkc")

- このオプションを有効にすると、復元後に作成されるクラスターは、以下で指定された KMS キーを使用して暗号化されます。

- このオプションを無効にすると、復元後に作成されるクラスターは暗号化されません。

## FAQ\{#faq}

**復元されたクラスターはどの Milvus バージョンで動作しますか？**

デフォルトでは、クラスター全体の復元により、Zilliz Cloud がサポートする最新の GA メジャーバージョンでターゲットクラスターが作成されます。

- 過去 30 日以内に作成されたバックアップファイルで、元のクラスターが利用可能な最新の Milvus GA バージョンより前の GA バージョンを使用していた場合、復元後のクラスターで使用する Milvus バージョンを選択できます。デフォルトでは、Zilliz Cloud は最新の GA Milvus バージョンに復元します。

- 30 日より前に作成されたバックアップファイル、またはすでに最新の Milvus GA バージョンを使用しているバックアップファイルでは、ターゲット Milvus バージョンを変更できません。

たとえば、利用可能な最新の Milvus GA バージョンが 2.6.x であるとします。

- 過去 30 日以内に作成された 2.5.x のバックアップファイルから復元する場合、Zilliz Cloud はデフォルトで新しいクラスターを 2.6.x に復元しますが、2.5.x に復元するよう選択できます。

- 30 日より前に作成された 2.5.x のバックアップファイルから復元する場合、Zilliz Cloud はデフォルトで新しいクラスターを 2.6.x に復元し、ターゲット Milvus バージョンは変更できません。

- 2.6.x のバックアップファイルから復元する場合、Zilliz Cloud は新しいクラスターを 2.6.x に復元し、ターゲット Milvus バージョンは変更できません。
