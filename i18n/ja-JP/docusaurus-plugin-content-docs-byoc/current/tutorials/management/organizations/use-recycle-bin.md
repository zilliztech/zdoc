---
title: "Recycle Bin を使用する | BYOC"
slug: /use-recycle-bin
sidebar_label: "Recycle Bin を使用する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Recycle Bin 機能は、意図的に削除された場合でも、トライアルの有効期限切れやサービス停止の結果として削除された場合でも、削除されたすべてのクラスターの記録を保持することでデータを保護します。考えが変わった場合やクラスターを誤って削除した場合、Recycle Bin ではクラスターを復元するための 30 日間の猶予期間が提供されます。 | BYOC"
type: origin
token: JQvjwCDxhiMcj0kpaWicqXsTn1e
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Recycle Bin を使用する

Zilliz Cloud の Recycle Bin 機能は、意図的に削除された場合でも、トライアルの有効期限切れやサービス停止の結果として削除された場合でも、削除されたすべてのクラスターの記録を保持することでデータを保護します。考えが変わった場合やクラスターを誤って削除した場合、Recycle Bin ではクラスターを復元するための 30 日間の猶予期間が提供されます。

Recycle Bin を使用するには、**Organization Owner** である必要があります。

## Recycle Bin 内の削除済みクラスターを復元する\{#restore-a-dropped-cluster-in-the-recycle-bin}

![byoc-use-recycle-bin](https://zdoc-images.s3.us-west-2.amazonaws.com/byoc-use-recycle-bin.png "byoc-use-recycle-bin")

<Procedures>

1. 削除されたクラスターが属する組織に移動します。

1. 左側のナビゲーションメニューまたは上部のナビゲーションアイコンから **Recycle Bin** にアクセスします。

1. 復元するクラスターを見つけます。**Actions** ドロップダウンから **Restore Full Cluster** を選択します。

1. 復元するクラスターを設定します。

    1. この組織内の別のプロジェクトにクラスターを復元できますが、別のクラウドリージョンには復元できません。

    1. クラスターの名前を変更し、クエリ CU 数をリセットできます。

    1. 削除されたクラスターがどのように保持されたかによっては、復元ページで別の対象 Milvus バージョンを選択できる場合があります。バージョンセレクターが利用可能な場合は、復元後のクラスターに使用する Milvus バージョンを選択します。バージョンセレクターが利用できない場合、復元後のクラスターは元のクラスターバージョンを使用し、対象バージョンは変更できません。

    <Admonition type="info" icon="📘" title="注意">

    クラスター内のコレクションのロード状態は保持されます。

    </Admonition>

1. **Restore** をクリックします。Zilliz Cloud は指定された属性でクラスターの作成を開始し、作成されたクラスターにデータを復元します。

1. 新しい復元ジョブが生成されます。[Jobs](./job-center) ページでクラスターの復元進行状況を確認できます。ジョブのステータスが **IN PROGRESS** から **SUCCESSFUL** に変わると、復元は完了です。

</Procedures>
