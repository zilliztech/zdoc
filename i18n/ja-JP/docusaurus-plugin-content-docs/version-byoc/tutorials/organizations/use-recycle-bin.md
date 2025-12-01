---
title: "ごみ箱の使用 | BYOC"
slug: /use-recycle-bin
sidebar_label: "ごみ箱の使用"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudのごみ箱機能は、意図的にまたはトライアルの期限切れやサービスの停止の結果として削除されたすべてのクラスターの記録を保持することにより、データを保護します。気が変わった場合や誤ってクラスターを削除した場合、ごみ箱はクラスターの復元のための30日間の猶予期間を提供します。 | BYOC"
type: origin
token: JQvjwCDxhiMcj0kpaWicqXsTn1e
sidebar_position: 3
keywords:
  - zilliz
  - vector database
  - cloud
  - recycle bin
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search

---

import Admonition from '@theme/Admonition';


# ごみ箱の使用

Zilliz Cloudのごみ箱機能は、意図的にまたはトライアルの期限切れやサービスの停止の結果として削除されたすべてのクラスターの記録を保持することにより、データを保護します。気が変わった場合や誤ってクラスターを削除した場合、ごみ箱はクラスターの復元のための30日間の猶予期間を提供します。

ごみ箱を使用するには、**Organization Owner**である必要があります。

## ごみ箱内の削除されたクラスターを復元する\{#restore-a-dropped-cluster-in-the-recycle-bin}

1. 削除されたクラスターが所属する組織に移動します。

1. 左側のナビゲーションメニューまたは上部のナビゲーションアイコンから**ごみ箱**にアクセスします。

1. 復元するクラスターを見つけます。**アクション**ドロップダウンから**クラスターの復元**を選択します。

1. 復元されるクラスターを構成します。

    1. この組織の別のプロジェクトにクラスターを復元できますが、別のクラウドリージョンには復元できません。

    1. クラスターの名前を変更し、クエリCUの数をリセットできます。

    <Admonition type="info" icon="📘" title="ノート">

    <p>クラスター内のコレクションのロード状態は保持されます。</p>

    </Admonition>

1. **復元**をクリックします。Zilliz Cloudは、指定された属性を持つクラスターの作成を開始し、作成されたクラスターにデータを復元します。

1. 新しい復元ジョブが生成されます。クラスター復元の進捗状況は[ジョブ](./job-center)ページで確認できます。ジョブのステータスが**IN PROGRESS**から**SUCCESSFUL**に切り替わると、復元が完了します。

![byoc-use-recycle-bin](/img/byoc-use-recycle-bin.png)

