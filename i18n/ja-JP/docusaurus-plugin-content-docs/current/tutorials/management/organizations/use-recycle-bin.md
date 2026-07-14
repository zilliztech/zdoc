---
title: "Recycle Bin を使用する | Cloud"
slug: /use-recycle-bin
sidebar_label: "Recycle Bin を使用する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Recycle Bin 機能は、意図的に削除された場合でも、試用期限切れやサービス停止の結果として削除された場合でも、削除されたすべての Serverless および Dedicated クラスターの記録を保持することでデータを保護します。考えが変わった場合や誤ってクラスターを削除した場合でも、Recycle Bin ではクラスターを復元するための 30 日間の猶予期間が提供されます。 | Cloud"
type: origin
token: JQvjwCDxhiMcj0kpaWicqXsTn1e
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Recycle Bin を使用する

Zilliz Cloud の Recycle Bin 機能は、意図的に削除された場合でも、試用期限切れやサービス停止の結果として削除された場合でも、削除されたすべての Serverless および Dedicated クラスターの記録を保持することでデータを保護します。考えが変わった場合や誤ってクラスターを削除した場合でも、Recycle Bin ではクラスターを復元するための 30 日間の猶予期間が提供されます。

Recycle Bin を使用するには、**Organization Owner** である必要があります。

## 前提条件\{#prerequisites}

Recycle Bin 内のクラスターを復元するには、[支払い方法を追加](/docs/payment-billing)する必要があります。

## Recycle Bin 内の削除されたクラスターを復元する\{#restore-a-dropped-cluster-in-the-recycle-bin}

![use-recycle-bin](https://zdoc-images.s3.us-west-2.amazonaws.com/use-recycle-bin.png "use-recycle-bin")

<Procedures>

1. 削除されたクラスターが属する組織に移動します。

1. 左側のナビゲーションメニューまたは上部のナビゲーションアイコンから **Recycle Bin** にアクセスします。

1. 復元するクラスターを見つけます。**Actions** ドロップダウンから **Restore Full Cluster** を選択します。

1. 復元するクラスターを設定します。

    1. クラスターはこの組織配下の別のプロジェクトに復元できますが、別のクラウドリージョンには復元できません。

    1. クラスターの名前を変更し、クエリ CU 数をリセットできます。

    1. 削除されたクラスターがどのように保持されていたかによっては、復元ページで別のターゲット Milvus バージョンを選択できる場合があります。バージョンセレクターが利用可能な場合は、復元するクラスターの Milvus バージョンを選択します。バージョンセレクターが利用できない場合、復元されるクラスターでは元のクラスターバージョンが使用され、ターゲットバージョンは変更できません。

    <Admonition type="info" icon="📘" title="注意">

    クラスター内のコレクションのロード状態は保持されます。

    </Admonition>

1. **Restore** をクリックします。Zilliz Cloud は指定された属性でクラスターの作成を開始し、作成されたクラスターにデータを復元します。

1. 新しい復元ジョブが生成されます。[Jobs](./job-center) ページでクラスターの復元進行状況を確認できます。ジョブステータスが **IN PROGRESS** から **SUCCESSFUL** に変わると、復元は完了です。

</Procedures>
