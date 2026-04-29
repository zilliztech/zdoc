---
title: "グローバルクラスターの管理 | Cloud"
slug: /manage-global-cluster
sidebar_key: manage-global-cluster
sidebar_label: "グローバルクラスターの管理"
beta: FALSE
notebook: FALSE
description: "このページでは、セカンダリークラスターの追加と削除、グローバルクラスターを通常クラスターへ変換する方法、およびグローバルクラスターの完全な削除について説明します。 | Cloud"
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
  - 通常クラスターへ変換

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# グローバルクラスターの管理

このページでは、セカンダリークラスターの追加と削除、グローバルクラスターを通常クラスターへ変換する方法、およびグローバルクラスター全体を削除する方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は、<strong>ビジネスクリティカル</strong> プロジェクト内の <strong>Dedicated</strong> クラスターでのみ利用可能です。</p>

</Admonition>

## 始める前に\{#before-you-start}

- **プロジェクト管理者** であることを確認してください。

- プライマリークラスターとセカンダリークラスターの両方が停止されていないことに注意してください。

## セカンダリークラスターの追加\{#add-secondary-cluster}

リージョンカバレッジを向上させるために、既存のグローバルクラスターに異なるリージョンのセカンダリークラスターを追加できます。

<Admonition type="info" icon="📘" title="Notes">

<p>グローバルクラスターが保有できるセカンダリークラスターは最大 5 つまでです。</p>

</Admonition>

新しいセカンダリークラスターを追加すると、Zilliz Cloud がそれをプロビジョニングし、プライマリーからのデータ複製を開始します。新しいセカンダリークラスターは CREATING 状態として表示され、初期データ同期が完了すると RUNNING 状態に移行します。

以下のデモでは、1 つ以上のセカンダリークラスターを追加する方法を示しています。

<Supademo id="cmkat4dkp1h55ke4xyc8i7c9y" title=""  />

## セカンダリークラスターの削除\{#drop-secondary-cluster}

そのリージョンでのカバレッジが不要になった場合や、コストを削減したい場合に、セカンダリークラスターを削除できます。

セカンダリークラスターを削除すると、次のようになります。

- 削除されたセカンダリークラスターは、グローバルクラスターのトポロジから除去されます。

- そのクラスターへのデータ複製は直ちに停止します。

以下のスクリーンショットは、セカンダリークラスターを削除する方法を示しています。

![KjCvwgeZWhTEHnb1t3Pc1NoXnCb](https://zdoc-images.s3.us-west-2.amazonaws.com/KjCvwgeZWhTEHnb1t3Pc1NoXnCb.png)

## グローバルクラスターを通常クラスターへ変換する\{#convert-a-global-cluster-to-a-regular-cluster}

マルチリージョン機能が不要になったが、プライマリークラスターとそのデータを維持したい場合は、グローバルクラスターを通常の Dedicated クラスターに戻すことができます。

グローバルクラスターを通常クラスターに変換するには、次の手順が必要です。

<Procedures>

1. すべてのセカンダリークラスターを [削除](./manage-global-cluster#drop-secondary-cluster) します。

1. **グローバルクラスター** ページで、**Actions** ドロップダウンから **Remove Global Endpoint** をクリックします。

    ![Qg0Mw7gCGh9vlfbMpxockJPVnUg](https://zdoc-images.s3.us-west-2.amazonaws.com/Qg0Mw7gCGh9vlfbMpxockJPVnUg.png)

</Procedures>

グローバルエンドポイントが削除されると、グローバルエンドポイントを介して接続していたアプリケーションは直ちに切断されます。アプリケーションコード内の接続エンドポイントを更新してください。変換後に発生する事象を以下の表に示します。

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
     <td><p>通常の Dedicated クラスターになります。すべてのデータを保持したまま稼働を継続します。</p></td>
   </tr>
   <tr>
     <td><p>データ複製</p></td>
     <td><p>停止します。データ複製メトリクスは削除されます。</p></td>
   </tr>
   <tr>
     <td><p>グローバルクラスターのメタデータ</p></td>
     <td><p>クリアされます（グローバルクラスター ID、トポロジ）。</p></td>
   </tr>
   <tr>
     <td><p>バックアップポリシー</p></td>
     <td><p>元のプライマリークラスター上にそのまま残ります。</p></td>
   </tr>
   <tr>
     <td><p>請求</p></td>
     <td><p><a href="./data-transfer-cost">データ転送</a> の課金が停止します。残存するクラスターは通常の <a href="./dedicated-cluster-cost">Dedicated クラスター</a> として課金されます。</p></td>
   </tr>
</table>

## グローバルクラスターの削除\{#drop-global-cluster}

グローバルクラスター全体を削除するには、まず [すべてのセカンダリークラスターを削除](./manage-global-cluster#drop-secondary-cluster) し、その後プライマリークラスターを削除します。プライマリークラスターが削除されると、グローバルクラスターは自動的に削除されます。

