---
title: "プライベートリンクの設定（Azure） | Cloud"
slug: /setup-a-private-link-azure
sidebar_label: "プライベートリンクの設定（Azure）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudクラスタから異なるMicrosoft Azure VPCでホストされているサービスへのプライベートリンクを設定する手順を説明します。 | Cloud"
type: origin
token: W2fZwrrhVibvpGkd0MbcQGJQnib
sidebar_position: 3
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - プライベートリンク
  - privatelink
  - プライベートエンドポイント
  - private service connect
  - aws
  - gcp
  - azure
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb

---

import Admonition from '@theme/Admonition';


# プライベートリンクの設定（Azure）

このガイドでは、Zilliz Cloudクラスタから異なるMicrosoft Azure VPCでホストされているサービスへのプライベートリンクを設定する手順を説明します。

<Admonition type="info" icon="📘" title="注釈">

<p>この機能は<strong>専用</strong>クラスタでのみ利用可能です。</p>

</Admonition>

プライベートリンクはプロジェクトレベルで設定され、同じプロジェクト内の同じクラウドプロバイダーとリージョンにデプロイされたすべてのクラスタに対して有効です。

<Admonition type="info" icon="📘" title="注釈">

<p>Zilliz Cloudはプライベートリンクの利用料を請求しません。ただし、クラウドプロバイダーは、Zilliz Cloudにアクセスするために作成した各エンドポイントに対して<a href="https://azure.microsoft.com/en-us/pricing/details/private-link/">料金を請求する</a>場合があります。</p>

</Admonition>

## 開始する前に\{#before-you-start}

以下の条件が満たされていることを確認してください：

- このガイドで作成するプライベートエンドポイントはグローバルにアクセス可能であることに注意してください。対象のZilliz Cloudクラスタとは異なるリージョンのサービスでも、クラスタに接続できます。

## プライベートエンドポイントの作成\{#create-private-endpoint}

Zilliz Cloudは、プライベートエンドポイントを追加するための直感的なWebコンソールを提供します。対象のプロジェクトに移動し、左側のナビゲーションで**ネットワーク > プライベートエンドポイント**をクリックし、**+ プライベートエンドポイント**をクリックします。

![PYylbfopjoFkiZxFlbucIFHkn8g](/img/PYylbfopjoFkiZxFlbucIFHkn8g.png)

### ステップ1：クラウドプロバイダーとリージョンを選択\{#step-1-select-a-cloud-provider-and-region}

Azureリージョンにデプロイされたクラスタのプライベートエンドポイントを作成するには、**クラウドプロバイダー**ドロップダウンリストから**Azure**を選択します。**リージョン**で、プライベートアクセスしたいクラスタがあるリージョンを選択し、**次へ**をクリックします。

利用可能なクラウドプロバイダーとリージョンの詳細については、[クラウドプロバイダーとリージョン](./cloud-providers-and-regions)を参照してください。

![CguAbg90loxAJ4x0cl6c58rqnvO](/img/CguAbg90loxAJ4x0cl6c58rqnvO.png)

### ステップ2：エンドポイントサービスを確立\{#step-2-establish-an-endpoint-service}

![Z54SboHLyoKB1QxAG4Dcw7bEnOh](/img/Z54SboHLyoKB1QxAG4Dcw7bEnOh.png)

[Microsoft Azureサブスクリプションページ](https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBladeV1)からコピーしたサブスクリプションIDを入力します。以下に例を示します。

![KmCYbkbpDoJHAkxDzN9cV1LOnng](/img/KmCYbkbpDoJHAkxDzN9cV1LOnng.png)

### ステップ3：エンドポイントを作成\{#step-3-create-an-endpoint}

このステップはクラウドプロバイダーのコンソールで完了する必要があります。

1. [プライベートリンクセンター](https://portal.azure.com/#view/Microsoft_Azure_Network/PrivateLinkCenterBlade/~/privateendpoints)に移動し、**+ 作成**をクリックします。

    ![TQB9bT5KKojscoxcOZbcZ4Q6nNf](/img/TQB9bT5KKojscoxcOZbcZ4Q6nNf.png)

1. 作成するプライベートエンドポイントの基本情報を入力します。

    ![ECcPbN4Kaog5bdxyed3cyP3HnHe](/img/ECcPbN4Kaog5bdxyed3cyP3HnHe.png)

1. **次へ: リソース >**をクリックし、**リソースIDまたはエイリアスでAzureリソースに接続**を選択します。次に、Zilliz Cloudコンソールからコピーしたものを**リソースIDまたはエイリアス**に貼り付けます。

    ![TDJVb0pkWoxVPIxCThvct9Hpnae](/img/TDJVb0pkWoxVPIxCThvct9Hpnae.png)

1. **仮想ネットワーク**と**サブネット**で適切な値を選択し、このタブの他の設定はデフォルトのままにします。

    ![SNdZbzo0EoP7PYxg1z4clUijnQg](/img/SNdZbzo0EoP7PYxg1z4clUijnQg.png)

1. **レビューと作成**タブに到達するまで**次へ**をクリックします。検証が成功したら、**作成**をクリックしてプライベートエンドポイントを作成します。

    ![FJ95b4S4voMavqxFWEac3JdinAc](/img/FJ95b4S4voMavqxFWEac3JdinAc.png)

1. デプロイが成功すると、以下が表示されます。

    ![QNHubedZWoJFe7xkX5ac5TOInzg](/img/QNHubedZWoJFe7xkX5ac5TOInzg.png)

1. **リソースに移動**をクリックし、作成されたプライベートエンドポイントの概要ページを表示します。

1. **概要**ページの右上隅で**JSON表示**をクリックします。**接続ステータス**が**保留中**と表示されていることに注意してください。

    ![YYrobZKr4oFJJ8xNRYicL2PZnde](/img/YYrobZKr4oFJJ8xNRYicL2PZnde.png)

    **リソースJSON**パネルで、`name`と`properties.resourceGuid`の値をコピーします。エンドポイントIDは、これら2つの値をピリオド（`.`）で結合したものになります。

    ![Vm7pbEGggo2tx6xirE3c9ZyRnSg](/img/Vm7pbEGggo2tx6xirE3c9ZyRnSg.png)

    たとえば、キー`name`の値が`zilliz`で、キー`properties.resourceGuid`の値が`d73e9b55-7b9c-4f8d-8f0a-40e737f1ccbf`の場合、プライベートエンドポイントIDは`zilliz.d73e9b55-7b9c-4f8d-8f0a-40e737f1ccbf`になります。

### ステップ4：エンドポイントを承認\{#step-4-authorize-your-endpoint}

Azureコンソールから取得したエンドポイントIDをZilliz Cloudの**エンドポイントID**ボックスに貼り付け、**作成**をクリックします。

## プライベートリンクを取得\{#obtain-a-private-link}

提出した上記の属性を検証および承認した後、Zilliz Cloudはこのエンドポイントにプライベートリンクを割り当てます。このプロセスには約5分かかります。

プライベートリンクが準備できると、Zilliz Cloudの**プライベートリンク**ページで確認できます。

## DNSの設定\{#set-up-dns}

Zilliz Cloudが割り当てたプライベートリンク経由でクラスタにアクセスする前に、DNSを設定する必要があります。

### ステップ1：AzureポータルでプライベートDNSゾーンを作成\{#step-1-create-a-private-dns-zone-on-the-azure-portal}

1. 作成されたプライベートエンドポイントの**概要**ページで、**設定** > **DNS構成**を選択し、プライベートエンドポイントと一緒に作成されたネットワークインターフェースの**IPアドレス**をコピーします。

    ![GC9jbsUp2oXgCZxkojbcrmJanJb](/img/GC9jbsUp2oXgCZxkojbcrmJanJb.png)

    上記のスクリーンショットの例の値は**10.0.0.4**です。

1. [プライベートDNSゾーンの作成](https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.Network%2FprivateDnsZones)に移動し、**+ 作成**をクリックしてプロセスを開始します。

1. **基本**タブで、上記で使用したサブスクリプションとリソースグループを選択し、Zilliz CloudコンソールからコピーしたプライベートリンクURIを**インスタンスの詳細** > **名前**に貼り付けます。次に**レビューと作成**をクリックします。

    ![QweWbLRSioY9Cix8nMUc0Q75n1e](/img/QweWbLRSioY9Cix8nMUc0Q75n1e.png)

1. 検証が成功したら、**作成**をクリックしてプロセスを開始します。

    ![LsmabNzrwoz9lvxJpKac2gEdnGG](/img/LsmabNzrwoz9lvxJpKac2gEdnGG.png)

1. デプロイが成功すると、以下が表示されます。

    ![LGB3bC80FoQnXIxx527cVkTMnAe](/img/LGB3bC80FoQnXIxx527cVkTMnAe.png)

1. **リソースに移動**をクリックし、作成されたプライベートDNSゾーンの**概要**ページを表示します。

    ![M401b0RiNoauaHxbBH6crLXlnXc](/img/M401b0RiNoauaHxbBH6crLXlnXc.png)

### ステップ2：プライベートDNSゾーンを仮想ネットワークにリンク\{#step-2-link-the-private-dns-zone-to-your-virtual-network}

1. 作成されたプライベートDNSゾーンの概要ページで、左側のナビゲーションペインで**設定** > **DNS管理**を選択します。

1. **+ 追加**をクリックします。**仮想ネットワークリンクの追加**ダイアログボックスで、**リンク名**を入力し、上記で使用した**サブスクリプション**と**仮想ネットワーク**を選択します。**構成**セクションで**自動登録を有効にする**も選択します。

    ![KQZ2bvbbUodBlAxV98ccbrwxnWg](/img/KQZ2bvbbUodBlAxV98ccbrwxnWg.png)

    すべてが期待通りに設定されたら、**OK**をクリックして続行します。作成された仮想ネットワークリンクのリンクステータスは、デプロイが成功すると**完了**に変わります。

    ![R84pbAxcKo24pDxQvlKcyxV7n4b](/img/R84pbAxcKo24pDxQvlKcyxV7n4b.png)

1. 左側のナビゲーションペインで**概要**をクリックして、プライベートDNSゾーンの**概要**ページに戻ります。

    ![S4bTb3ICwoWnlgxqSFrcYwEInvh](/img/S4bTb3ICwoWnlgxqSFrcYwEInvh.png)

1. **+ レコードセット**をクリックします。**レコードセットの追加**ダイアログボックスで、**名前**にクラスタIDに`-privatelink`を付けたものを入力し、**種類**で**A - アドレスレコード**を選択し、**TTL**を**10分**に設定します。リストされているIPアドレスがメモしたものかどうかを確認します。

    ![DtFQb18jloG9JDxYg0AcSlRsn75](/img/DtFQb18jloG9JDxYg0AcSlRsn75.png)

    **OK**をクリックしてレコードセットを保存します。

    ![YWSZbd4qEoAW64xf9gHcamC8nyd](/img/YWSZbd4qEoAW64xf9gHcamC8nyd.png)

1. Azureポータルで作成されたプライベートエンドポイントの概要ページに戻ると、プライベートエンドポイントの**接続ステータス**が**保留中**から**承認済み**に変わっていることがわかります。

    ![CqAEbOjDUogQGdxl3gjclaPAn1e](/img/CqAEbOjDUogQGdxl3gjclaPAn1e.png)

    これで、Azure仮想ネットワーク内のリソースがZilliz Cloudクラスタにプライベートアクセスできるようになります。

## クラスタへのインターネットアクセスを管理\{#manage-internet-access-to-your-clusters}

プライベートエンドポイントを設定した後、クラスタのパブリックエンドポイントを無効にして、プロジェクトへのインターネットアクセスを制限することを選択できます。パブリックエンドポイントを無効にすると、ユーザーはプライベートリンクを使用してのみクラスタに接続できます。

パブリックエンドポイントを無効にするには：

1. 対象クラスタの**クラスタ詳細**ページに移動します。

1. **接続**セクションに移動します。

1. クラスタのパブリックエンドポイントの隣にある設定アイコンをクリックします。

1. 情報を読み、**パブリックエンドポイントの無効化**ダイアログボックスで**無効化**をクリックします。

<Admonition type="info" icon="📘" title="注釈">

<ul>
<li><p>プライベートエンドポイントは<a href="/reference/restful/data-plane-v2">データプレーン</a>アクセスにのみ影響します。<a href="/reference/restful/control-plane-v2">コントロールプレーン</a>は引き続き公開インターネット経由でアクセスできます。</p></li>
<li><p>パブリックエンドポイントを再度有効にした後、パブリックエンドポイントにアクセスできるようになるまで、ローカルDNSキャッシュの有効期限が切れるのを待つ必要がある場合があります。</p></li>
</ul>

</Admonition>

![disable_public_endpoint](/img/disable_public_endpoint.png)

## FAQ\{#faq}

### 既存のクラスタにプライベートエンドポイントを作成できますか？\{#can-i-create-a-private-endpoint-for-an-existing-cluster}

はい。プライベートエンドポイントを作成すると、同じリージョンとプロジェクトに存在するすべての既存および将来の専用（エンタープライズ）クラスタに有効になります。必要なのは、異なるクラスタに異なるDNSレコードを追加することだけです。