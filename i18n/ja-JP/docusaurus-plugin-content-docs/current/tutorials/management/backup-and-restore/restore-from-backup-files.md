---
title: "バックアップファイルから復元 | Cloud"
slug: /restore-from-backup-files
sidebar_label: "バックアップファイルから復元"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の復元機能を使用すると、偶発的なデータ損失、破損、またはシステム障害が発生した場合にバックアップファイルからデータを復旧でき、事業継続性を確保できます。これは、インシデントからの復旧、意図しない変更の巻き戻し、または最小限の中断でテスト用にクラスターを複製するための信頼性の高い方法です。 | Cloud"
type: origin
token: Dd6jwYIGiiz6HWkEPJqcpMA3n6g
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップファイルから復元

Zilliz Cloud の復元機能を使用すると、偶発的なデータ損失、破損、またはシステム障害が発生した場合にバックアップファイルからデータを復旧でき、事業継続性を確保できます。これは、インシデントからの復旧、意図しない変更の巻き戻し、または最小限の中断でテスト用にクラスターを複製するための信頼性の高い方法です。

このガイドでは、バックアップファイルからクラスター全体または一部を復元する方法を説明します。

<Admonition type="info" icon="📘" title="注">

この機能は **Dedicated** クラスターでのみ利用できます。

</Admonition>

## 制限事項\{#limits}

- **アクセス制御**: プロジェクト管理者、組織所有者、またはバックアップ権限を持つカスタムロールが必要です。

## クラスター全体を復元する\{#restore-a-full-cluster}

すべてのデータベースとコレクションを含むクラスター全体を、**新しい** クラスターに復元できます。これは、テストや復旧のために環境を複製する場合に便利です。クラスター全体を復元するには、バックアップファイルがクラスターバックアップである必要があります。

復元中に、以下も設定できます。

- RBAC 設定を含めるかどうかを選択します。

- 復元後の新しいクラスターの Milvus バージョンを選択します。

    - 過去 30 日以内に作成されたバックアップファイルについて、元のクラスターが最新の利用可能な Milvus GA バージョンより前の Milvus GA バージョンを使用していた場合、復元後のクラスターの Milvus バージョンを選択できます。デフォルトでは、Zilliz Cloud はクラスターを最新の GA Milvus バージョンに復元します。

    - 30 日より前に作成されたバックアップファイル、またはすでに最新の Milvus GA バージョンを使用しているバックアップファイルについては、対象の Milvus バージョンを変更できません。

    たとえば、最新の利用可能な Milvus GA バージョンが 2.6.x であるとします。

    - 過去 30 日以内に作成された 2.5.x のバックアップファイルから復元する場合、Zilliz Cloud はデフォルトで新しいクラスターを 2.6.x に復元しますが、2.5.x に復元することも選択できます。

    - 30 日より前に作成された 2.5.x のバックアップファイルから復元する場合、Zilliz Cloud はデフォルトで新しいクラスターを 2.6.x に復元し、対象の Milvus バージョンは変更できません。

    - 2.6.x のバックアップファイルから復元する場合、Zilliz Cloud は新しいクラスターを 2.6.x に復元し、対象の Milvus バージョンは変更できません。

- CMEK による保存時暗号化を有効にするかどうかを選択します。詳細については、[Customer-Managed Encryption Keys](./cmek) を参照してください。

復元後、`db_admin` ユーザーには **新しいパスワード** が生成されます。このパスワードを使用して復元されたクラスターに接続してください。

### Web コンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloud Web コンソールでクラスター全体を復元する方法を示します。

<Supademo id="cmcsruzjd0gyo9st8kcjye30i" title=""  />

### RESTful API 経由\{#via-restful-api}

次の例では、既存のバックアップファイルからクラスター全体を `Dedicated-01-backup` という名前の新しいクラスターに復元します。RESTful API の詳細については、[Restore Cluster Backup](/reference/restful/restore-cluster-backup-v2) を参照してください。

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

次の表では、各パラメータについて説明します。

<table>
   <tr>
     <th><p><strong>パラメータ</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p><code>targetProjectId</code></p></td>
     <td><p>復元されたクラスターが作成される対象プロジェクトの ID。</p></td>
   </tr>
   <tr>
     <td><p><code>clusterName</code></p></td>
     <td><p>復元されたクラスターの名前。</p></td>
   </tr>
   <tr>
     <td><p><code>cuSize</code></p></td>
     <td><p>復元されたクラスターの Query CU サイズ。</p></td>
   </tr>
   <tr>
     <td><p><code>collectionStatus</code></p></td>
     <td><p>復元後にコレクションのロード状態を保持するかどうか。使用可能なオプションは次のとおりです。</p><ul><li><p><code>KEEP</code>: 元のコレクション状態を保持します。</p></li><li><p><code>RELEASE</code>: すべてのコレクションをリリースします</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>restoreVersionPolicy</code></p></td>
     <td><p>復元されたクラスターの互換性のある Milvus バージョン。使用可能なオプションは次のとおりです。</p><ul><li><p><code>ORIGINAL</code>: クラスターを元の互換 Milvus バージョンに復元します。</p></li><li><p><code>LATEST</code>: クラスターを利用可能な最新の GA Milvus バージョンに復元します。</p></li></ul></td>
   </tr>
</table>

以下は出力例です。復元ジョブが生成され、進行状況は [プロジェクトジョブセンター](./job-center) で確認できます。

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

## クラスターの一部を復元する\{#restore-a-partial-cluster}

特定のデータベースとコレクションのみを **既存のクラスター** に復元することもできます。

### Web コンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloud Web コンソールでクラスター内の特定のデータベースとコレクションを復元する方法を示します。

<Supademo id="cmcss7xi00h8c9st8qsqnutnn" title=""  />

### RESTful API 経由\{#via-restful-api}

次の例では、バックアップファイルからコレクションを既存のクラスター `inxx-xxxxxxxxxxxxxxx` に復元します。RESTful API の詳細については、[Restore Collection Backup](/reference/restful/restore-collection-backup-v2) を参照してください。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/restoreCollection" \
--header "Authorization: Bearer ${API_KEY}" \
--header "Content-Type: application/json" \
-d '{
    "destClusterId": "inxx-xxxxxxxxxxxxxxx",
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

以下は出力例です。復元ジョブが生成され、進行状況は [プロジェクトジョブセンター](./job-center) で確認できます。

```bash
{
  "code": 0,
  "data": {
    "jobId": "job-04bf9335838dzkeydpxxxx"
  }
}
```

## 暗号化されたバックアップファイルから復元する\{#restore-from-an-encrypted-backup-file}

暗号化されたバックアップを新しいクラスターに復元する場合、Zilliz Cloud はバックアップファイルに関連付けられた KMS キーを使用して復元前にデータを復号します。したがって、暗号化の有無にかかわらず、そのバックアップを新しいクラスターに復元できます。 

<Admonition type="info" icon="📘" title="注">

この機能は、**Business Critical** プロジェクト内の **Dedicated** クラスターでのみ利用できます。

</Admonition>

![WaApbDlaYoywaMxxUMxcQLAOnDe](https://zdoc-images.s3.us-west-2.amazonaws.com/waapbdlayoywamxxumxcqlaonde.png "WaApbDlaYoywaMxxUMxcQLAOnDe")

暗号化されたバックアップからの復元手順は通常の復元とほぼ同じで、異なるのは **Encryption at Rest with CMEK** を有効にするかどうかだけです。

![V1QJb3SK1oGa11xLljhcxKQEnkc](https://zdoc-images.s3.us-west-2.amazonaws.com/v1qjb3sk1oga11xlljhcxkqenkc.png "V1QJb3SK1oGa11xLljhcxKQEnkc")

- このオプションを有効にすると、復元後に作成されるクラスターは以下で指定した KMS キーを使用して暗号化されます。

- このオプションを無効にすると、復元後に作成されるクラスターは暗号化されません。

## FAQ\{#faq}

**復元されたクラスターはどの Milvus バージョンで動作しますか？**

デフォルトでは、クラスター全体の復元では、Zilliz Cloud がサポートする最新の GA メジャーバージョンで対象クラスターが作成されます。

- 過去 30 日以内に作成されたバックアップファイルについて、元のクラスターが最新の利用可能な Milvus GA バージョンより前の Milvus GA バージョンを使用していた場合、復元後のクラスターの Milvus バージョンを選択できます。デフォルトでは、Zilliz Cloud はクラスターを最新の GA Milvus バージョンに復元します。

- 30 日より前に作成されたバックアップファイル、またはすでに最新の Milvus GA バージョンを使用しているバックアップファイルについては、対象の Milvus バージョンを変更できません。

たとえば、最新の利用可能な Milvus GA バージョンが 2.6.x であるとします。

- 過去 30 日以内に作成された 2.5.x のバックアップファイルから復元する場合、Zilliz Cloud はデフォルトで新しいクラスターを 2.6.x に復元しますが、2.5.x に復元することも選択できます。

- 30 日より前に作成された 2.5.x のバックアップファイルから復元する場合、Zilliz Cloud はデフォルトで新しいクラスターを 2.6.x に復元し、対象の Milvus バージョンは変更できません。

- 2.6.x のバックアップファイルから復元する場合、Zilliz Cloud は新しいクラスターを 2.6.x に復元し、対象の Milvus バージョンは変更できません。

