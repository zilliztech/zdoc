---
title: "ホワイトリストを設定 | Cloud"
slug: /setup-whitelist
sidebar_label: "ホワイトリストを設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでのホワイトリストは、プロジェクトレベルで堅牢なセキュリティ層として機能し、指定されたプロジェクト内のすべてのクラスターにその利点を提供します。ホワイトリストを実装することで、プロジェクトのクラスターへのアクセスを特定のIPアドレスグループに限定し、悪意ある攻撃のリスクを大幅に軽減できます。 | Cloud"
type: origin
token: FnS1wY0iuia4qgkMycVclZyHnOf
sidebar_position: 1
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - ホワイトリスト
  - 設定
  - レクシカル検索
  - 最近傍検索
  - エゼントRAG
  - rag llmアーキテクチャ

---

import Admonition from '@theme/Admonition';


# ホワイトリストを設定

Zilliz Cloudでのホワイトリストは、プロジェクトレベルで堅牢なセキュリティ層として機能し、指定されたプロジェクト内のすべてのクラスターにその利点を提供します。ホワイトリストを実装することで、プロジェクトのクラスターへのアクセスを特定のIPアドレスグループに限定し、悪意ある攻撃のリスクを大幅に軽減できます。

## 始める前に\{#before-you-start}

先に進む前に以下の前提条件が満たされていることを確認してください：

- Zilliz Cloudにサインアップしています。アカウント登録方法については、「[Zilliz Cloudに登録](./register-with-zilliz-cloud)」を参照してください。

- ホワイトリストを設定したい組織またはプロジェクトの所有者であること。ロールと権限の詳細については、「[組織ユーザーの管理](./organization-users)」および「[プロジェクトユーザーの管理](./project-users)」を参照してください。

## 手順\{#procedure}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. ホワイトリストを設定する特定の組織とプロジェクトに移動します。

1. 左側のナビゲーションペインで、**ネットワーク** > **IPアドレス**を選択します。

1. **IPアドレスを追加**をクリックします。

1. 表示されるダイアログボックスで、**IPアドレス（CIDR）**と**説明**を指定します。

    以下の表は各フィールドを説明しています。

    <table>
       <tr>
         <th><p><strong>フィールド</strong></p></th>
         <th><p><strong>説明</strong></p></th>
       </tr>
       <tr>
         <td><p>IPアドレス（CIDR）</p></td>
         <td><p>ホワイトリストに追加するIPアドレスまたはCIDRブロック。最大100個のCIDRブロックが許可されます。例：192.168.1.1/20。</p></td>
       </tr>
       <tr>
         <td><p>説明</p></td>
         <td><p>ホワイトリストに登録されたIPアドレスまたはCIDRブロックの説明。</p></td>
       </tr>
    </table>

1. **追加**をクリックします。

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>ホワイトリストにエントリがない場合、Zilliz CloudはすべてのIPアドレスからのアクセスを許可します。</p></li>
<li><p>CIDRブロックを追加すると、クラスターアクセスはそのブロック内のIPアドレスにのみ限定されます。</p></li>
<li><p>0.0.0.0/0を追加すると、空のホワイトリストと同等になります。</p></li>
</ul>

</Admonition>

![whitelist-ip-access](/img/whitelist-ip-access.png)

## 関連トピック\{#related-topics}

- [APIキー](./manage-api-keys)

- [クラスターロredentials（コンソール）](./cluster-credentials)

- [プライベートリンクを設定](./setup-a-private-link)