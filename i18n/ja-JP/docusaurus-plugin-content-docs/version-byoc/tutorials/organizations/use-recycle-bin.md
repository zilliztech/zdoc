---
title: "ごみ箱の使用 | BYOC"
slug: /use-recycle-bin
sidebar_key: use-recycle-bin
sidebar_label: "ごみ箱の使用"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud のごみ箱機能は、意図的かどうか、またはトライアル期間の満了やサービス停止の結果として削除されたすべてのクラスターの記録を保持することで、データを保護します。気が変わったり、誤ってクラスターを削除したりした場合でも、ごみ箱ではクラスターの復元のために 30 日間の猶予期間を提供します。| BYOC"
type: origin
token: JQvjwCDxhiMcj0kpaWicqXsTn1e
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - ごみ箱

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# ごみ箱の使用

Zilliz Cloud のごみ箱機能は、意図的かどうかにかかわらず、トライアル期間の満了やサービス停止の結果として削除されたすべてのクラスターの記録を保持することで、データを保護します。気が変わったり、誤ってクラスターを削除したりした場合でも、ごみ箱ではクラスターの復元のために 30 日間の猶予期間が提供されます。

ごみ箱を使用するには、**組織オーナー**である必要があります。

## ごみ箱内で削除されたクラスターを復元する\{#restore-a-dropped-cluster-in-the-recycle-bin}

![byoc-use-recycle-bin](https://zdoc-images.s3.us-west-2.amazonaws.com/byoc-use-recycle-bin.png "byoc-use-recycle-bin")

<Procedures>

1. 削除されたクラスターが属する組織に移動します。

1. 左側のナビゲーションメニューまたは上部のナビゲーションアイコンから**ごみ箱**にアクセスします。

1. 復元するクラスターを探します。**アクション**ドロップダウンから**クラスターの復元**を選択します。

1. 復元されたクラスターを設定します。

    1. クラスターはこの組織内の別のプロジェクトに復元できますが、異なるクラウドリージョンには復元できません。

    1. クラスターの名前を変更し、クエリ CU の数をリセットできます。

    <Admonition type="info" icon="📘" title="Notes">

    <p>クラスター内コレクションのロード状態は保持されます。</p>

    </Admonition>

1. **復元**をクリックします。Zilliz Cloud は指定された属性でクラスターの作成を開始し、作成されたクラスターにデータを復元します。

1. 新しい復元ジョブが生成されます。[ジョブ](./job-center) ページでクラスターの復元進捗状況を確認できます。ジョブのステータスが**IN PROGRESS**から**SUCCESSFUL**に切り替わると、復元が完了します。

</Procedures>