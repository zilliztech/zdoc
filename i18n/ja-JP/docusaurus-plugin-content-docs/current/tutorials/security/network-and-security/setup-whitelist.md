---
title: "ホワイトリストの設定 | Cloud"
slug: /setup-whitelist
sidebar_label: "ホワイトリストの設定"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudのホワイトリストは、プロジェクトレベルで堅牢なセキュリティレイヤーとして機能し、指定されたプロジェクト内のすべてのクラスターにその利点を拡張します。ホワイトリストを実装することで、プロジェクトのクラスターへのアクセスを特定のIPアドレスグループに効果的に絞り込み、悪意のある攻撃のリスクを大幅に軽減できます。 | Cloud"
type: origin
token: D1TiwX8o1iIBL3kMyCacjFwMnEf
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - whitelist
  - setup
  - what are vector databases
  - vector databases comparison
  - Faiss
  - Video search

---

import Admonition from '@theme/Admonition';


# ホワイトリストの設定

Zilliz Cloudのホワイトリストは、プロジェクトレベルで堅牢なセキュリティレイヤーとして機能し、指定されたプロジェクト内のすべてのクラスターにその利点を拡張します。ホワイトリストを実装することで、プロジェクトのクラスターへのアクセスを特定のIPアドレスグループに効果的に絞り込み、悪意のある攻撃のリスクを大幅に軽減できます。

## 始める前に{#before-you-start}

次に進む前に、次の前提条件が満たされていることを確認してください:

- Zilliz Cloudにサインアップしました。アカウントの登録方法については、「[Zilliz Cloudに登録する](./register-with-zilliz-cloud)」を参照してください。

- ホワイトリストを設定する組織またはプロジェクトの所有者です。役割と権限については、「[組織のユーザーを管理する](./organization-users)」および「[プロジェクトのユーザーを管理する](./project-users)」を参照してください。

## 手続き{#procedure}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. ホワイトリストを構成する特定の組織とプロジェクトに移動してください。

1. 左側のナビゲーションウィンドウで、[**ネットワーク**]>[**IPアドレス**]を選択します。

1. [**IPアドレスを追加**]をクリックします。

1. 表示されるダイアログボックスで、**IPアドレス(CIDR)**と**説明**を指定してください。

    フィールドの説明を次の表に示します。

    <table>
       <tr>
         <th><p><strong>フィールド</strong></p></th>
         <th><p><strong>説明する</strong></p></th>
       </tr>
       <tr>
         <td><p>IPアドレス(CIDR)</p></td>
         <td><p>ホワイトリストに追加するIPアドレスまたはCIDRブロック。最大20個のCIDRブロックを許可します。例:192.168.1.1/20。</p></td>
       </tr>
       <tr>
         <td><p>説明する</p></td>
         <td><p>ホワイトリストに登録されたIPアドレスまたはCIDRブロックの説明。</p></td>
       </tr>
    </table>

1. [**追加**]をクリックします。

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>ホワイトリストにエントリがない場合、Zilliz Cloudは任意のIPアドレスからアクセスを許可します。</p></li>
<li><p>CIDRブロックを追加すると、クラスターアクセスはそのブロック内のIPアドレスに限定されます。</p></li>
<li><p>「0.0.0.0/0」を追加すると、ホワイトリストが空になります。</p></li>
</ul>

</Admonition>

![whitelist-ip-access](/img/whitelist-ip-access.png)

## 関連するトピック{#related-topics}

- [APIキー](./manage-api-keys)

- [クラスタの認証情報(コンソール)](./cluster-credentials)

- [プライベートエンドポイントを設定する](./setup-a-private-link)

