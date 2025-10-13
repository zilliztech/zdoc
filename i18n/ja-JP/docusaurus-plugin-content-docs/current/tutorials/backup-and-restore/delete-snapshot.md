---
title: "バックアップファイルを削除 | Cloud"
slug: /delete-snapshot
sidebar_label: "バックアップファイルを削除"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、手動または自動でバックアップを作成することができます。 | Cloud"
type: origin
token: Mvj6wH6V8iAx0ukUu6zccHKSnvc
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - delete
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# バックアップファイルを削除

Zilliz Cloudは、手動または自動でバックアップを作成することができます。

手動で作成されたバックアップファイルについては、Zilliz Cloudはそれらを永久に保持します。クラスタを削除しても、手動で作成されたバックアップファイルは削除されません。したがって、必要がなくなったときにのみ手動で削除できます。

自動的に作成されたバックアップファイルについて、Zilliz Cloudはリテンション期間の終了時または対応するクラスタが削除されたときに自動的に削除します。ただし、その前に自動的に作成されたバックアップファイルを手動で削除するオプションがあります。

## 始める前に{#before-you-start}

以下の条件が満たされていることを確認してください。

- ターゲット組織で[組織所有者](./organization-users)または[プロジェクト管理者](./project-users)の役割が付与されていること。

- クラスターは**専用**レベルで実行されます。

## 手続き{#procedures}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

![delete_backups](/img/delete_backups.png)

Zilliz Cloudが実際に削除を実行する前に、バックアップファイルを削除する要求を確認するように求められます。

</TabItem>
<TabItem value="Bash">

バックアップファイルを削除します。パラメータの詳細については、[バックアップ削除](/reference/restful/delete-backup-v2)を参照してください。

```bash
curl --request DELETE \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json"
```

予想される出力:

```bash
{
  "code": 0,
  "data": {
    "backupId": "backup11_dbf5a40a6e5xxxx",
    "backupName": "medium_articles_backup4"
  }
}
```

</TabItem>
</Tabs>

## 関連するトピック{#related-topics}

- [バックアップを作成](./create-snapshot)

- [自動バックアップをスケジュールする](./schedule-automatic-backups)

- [バックアップファイルを表示する](./view-snapshot-details)

- [バックアップファイルからの復元](./restore-from-snapshot)

