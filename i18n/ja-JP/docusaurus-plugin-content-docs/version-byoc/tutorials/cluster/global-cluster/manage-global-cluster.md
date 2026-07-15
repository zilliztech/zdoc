---
title: "グローバルクラスターの管理 | Cloud"
slug: /manage-global-cluster
sidebar_key: manage-global-cluster
sidebar_label: "グローバルクラスターを管理"
beta: FALSE
notebook: FALSE
description: "このページでは、セカンダリークラスターの追加と削除、グローバルクラスターから通常クラスターへの変換、およびグローバルクラスター全体の削除について説明します。 | Cloud"
type: origin
token: DW9wwFlgAiwOhBk2PgucY4URnke
sidebar_position: 7
keywords:
  - zilliz
  - ベクトルデータベース
  - cloud
  - milvus
  - グローバルクラスター
  - 管理
  - 通常クラスターへの変換

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# グローバルクラスターの管理

このページでは、セカンダリークラスターの追加と削除、グローバルクラスターから通常クラスターへの変換、およびグローバルクラスター全体の削除について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は、<strong>ビジネスクリティカル</strong> プロジェクトの <strong>Dedicated</strong> クラスターでのみ利用可能です。</p>

</Admonition>

## 開始前の準備\{#before-you-start}

- **プロジェクト管理者** であることを確認してください。

- プライマリークラスターとセカンダリークラスターの両方が停止状態でないことを確認してください。

## セカンダリークラスターの追加\{#add-secondary-cluster}

リージョンカバレッジを向上させるため、既存のグローバルクラスターに異なるリージョンのセカンダリークラスターを追加できます。

<Admonition type="info" icon="📘" title="Notes">

<p>グローバルクラスターは最大5つのセカンダリークラスターを持つことができます。</p>

</Admonition>

新しいセカンダリークラスターを追加すると、Zilliz Cloud はそのクラスターをプロビジョニングし、プライマリークラスターからのデータレプリケーションを開始します。新しいセカンダリークラスターは CREATING ステータスで表示され、初期データ同期が完了すると RUNNING に移行します。

以下のデモでは、1つ以上のセカンダリークラスターを追加する方法を示しています。

<Supademo id="cmkat4dkp1h55ke4xyc8i7c9y" title=""  />

## セカンダリークラスターの削除\{#drop-secondary-cluster}

そのリージョンでのカバレッジが不要になった場合や、コストを削減したい場合は、セカンダリークラスターを削除できます。

セカンダリークラスターを削除すると、

- 削除されたセカンダリークラスターはグローバルクラスターのトポロジーから削除されます。

- そのクラスターへのデータレプリケーションは直ちに停止します。

以下のスクリーンショットは、セカンダリークラスターを削除する方法を示しています。

![KjCvwgeZWhTEHnb1t3Pc1NoXnCb](https://zdoc-images.s3.us-west-2.amazonaws.com/KjCvwgeZWhTEHnb1t3Pc1NoXnCb.png)

## グローバルクラスターから通常クラスターへの変換\{#convert-a-global-cluster-to-a-regular-cluster}

マルチリージョン機能が不要になったが、プライマリークラスターとそのデータを保持したい場合は、グローバルクラスターを通常の Dedicated クラスターに戻すことができます。

グローバルクラスターを通常クラスターに変換するには、以下が必要です。

<Procedures>

1. すべてのセカンダリークラスターを [削除](./manage-global-cluster#drop-secondary-cluster) します。

1. **グローバルクラスター** ページで、**アクション** ドロップダウンから **グローバルエンドポイントの削除** をクリックします。

    ![Qg0Mw7gCGh9vlfbMpxockJPVnUg](https://zdoc-images.s3.us-west-2.amazonaws.com/Qg0Mw7gCGh9vlfbMpxockJPVnUg.png)

</Procedures>

グローバルエンドポイントが削除されると、グローバルエンドポイント経由で接続されているアプリケーションは直ちに切断されます。アプリケーションコードの接続エンドポイントを更新してください。変換後の動作は以下の表に示す通りです。

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>動作</strong></p></th>
   </tr>
   <tr>
     <td><p>グローバルエンドポイント</p></td>
     <td><p>直ちに削除されます。これを使用しているクライアントは切断されます。</p></td>
   </tr>
   <tr>
     <td><p>プライマリークラスター</p></td>
     <td><p>通常の Dedicated クラスターになります。すべてのデータを保持したまま継続して実行されます。</p></td>
   </tr>
   <tr>
     <td><p>データレプリケーション</p></td>
     <td><p>停止します。データレプリケーションのメトリクスは削除されます。</p></td>
   </tr>
   <tr>
     <td><p>グローバルクラスターのメタデータ</p></td>
     <td><p>クリアされます（グローバルクラスターID、トポロジー）。</p></td>
   </tr>
   <tr>
     <td><p>バックアップポリシー</p></td>
     <td><p>以前のプライマリークラスターにそのまま残ります。変更はありません。</p></td>
   </tr>
   <tr>
     <td><p>請求</p></td>
     <td><p><a href="./data-transfer-cost">データ転送</a> 料金は停止します。残りのクラスターは通常の <a href="./dedicated-cluster-cost">Dedicated クラスター</a> として請求されます。</p></td>
   </tr>
</table>

## グローバルクラスターの削除\{#drop-global-cluster}

グローバルクラスター全体を削除するには、まず [すべてのセカンダリークラスターを削除](./manage-global-cluster#drop-secondary-cluster) し、その後プライマリークラスターを削除します。プライマリークラスターが削除されると、グローバルクラスターは自動的に削除されます。
