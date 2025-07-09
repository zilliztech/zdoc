---
title: "Azureでプライベートリンクを設定する | Cloud"
slug: /setup-a-private-link-azure
sidebar_label: "Azureでプライベートリンクを設定する"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudクラスターから異なるMicrosoft Azure VPCでホストされているサービスへのプライベートリンクを設定する手順を示します。 | Cloud"
type: origin
token: W2fZwrrhVibvpGkd0MbcQGJQnib
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - private link
  - privatelink
  - private endpoint
  - private service connect
  - aws
  - gcp
  - azure
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database

---

import Admonition from '@theme/Admonition';


# Azureでプライベートリンクを設定する

このガイドでは、Zilliz Cloudクラスターから異なるMicrosoft Azure VPCでホストされているサービスへのプライベートリンクを設定する手順を示します。

この機能は、専用(エンタープライズ)クラスターでのみ利用可能です。

プライベートリンクはプロジェクトレベルで設定され、このプロジェクトの下で同じクラウドプロバイダーとリージョンにデプロイされたすべてのクラスターに対して有効です。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloudはプライベートリンクに対して料金を請求しません。ただし、クラウドプロバイダーは、Zilliz Cloudにアクセスするために作成した<a href="https://azure.microsoft.com/en-us/pricing/details/private-link/">各エンドポイントごとに料金を請求します</a>を使用する場合があります。</p>

</Admonition>

## 始める前に{#before-you-start}

以下の条件が満たされていることを確認してください。

- 企業向けの専用クラスタが作成されました。クラスタの作成方法については、[クラスタ作成](./create-cluster)を参照してください。

## プライベートエンドポイントの作成{#create-private-endpoint}

Zilliz Cloudは、プライベートエンドポイントを追加するための直感的なWebコンソールを提供しています。ターゲットプロジェクトに移動し、左側のナビゲーションで**ネットワーク>プライベートエンドポイント**をクリックします。**+プライベートエンドポイント**をクリックします。

![setup_private_link_aws_01](/img/setup_private_link_aws_01.png)

### クラウドプロバイダーと地域を選択してください{#select-a-cloud-provider-and-region}

Azureリージョンにデプロイされたクラスターのプライベートエンドポイントを作成するには、Cloud ProviderドロップダウンリストからAzureを選択します。Regionで、プライベートにアクセスしたいクラスターを収容するリージョンを選択します。Nextをクリックしてください。 

利用可能なクラウドプロバイダーとリージョンの詳細については、[クラウドプロバイダー&地域](./cloud-providers-and-regions)を参照してください。 

![setup_private_link_window_azure](/img/setup_private_link_window_azure.png)

### エンドポイントサービスを確立する{#establish-and-endpoint-service}

![establish_endpoint_service_azure](/img/establish_endpoint_service_azure.png)

[Microsoft Azureのサブスクリプションページ](https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBladeV1)からコピーしたサブスクリプションIDを入力してください。以下は例です。

### エンドポイントを作成する{#create-an-endpoint}

クラウドプロバイダーコンソールでこの手順を完了する必要があります。

1. [プライベートリンクセンター](https://portal.azure.com/#view/Microsoft_Azure_Network/PrivateLinkCenterBlade/~/privateendpoints)に移動し、**+Create**をクリックしてください。

    ![TQB9bT5KKojscoxcOZbcZ4Q6nNf](/img/TQB9bT5KKojscoxcOZbcZ4Q6nNf.png)

1. 作成するプライベートエンドポイントの基本情報を入力してください。

    ![ECcPbN4Kaog5bdxyed3cyP3HnHe](/img/ECcPbN4Kaog5bdxyed3cyP3HnHe.png)

1. 「次へ:リソース」をクリックし、「リソースIDまたはエイリアスでAzureリソースに接続する」を選択します。その後、Zilliz Cloudコンソールからコピーしたものを「リソースIDまたはエイリアス」に貼り付けます。

    ![TDJVb0pkWoxVPIxCThvct9Hpnae](/img/TDJVb0pkWoxVPIxCThvct9Hpnae.png)

1. **仮想ネットワーク**と**サブネット**で適切な値を選択し、このタブの他の設定についてはデフォルトを維持してください。

    ![SNdZbzo0EoP7PYxg1z4clUijnQg](/img/SNdZbzo0EoP7PYxg1z4clUijnQg.png)

1. 「レビュー+作成」タブに到達するまで、「次へ」をクリックしてください。検証が合格した場合は、「作成」をクリックしてプライベートエンドポイントを作成してください。

    ![FJ95b4S4voMavqxFWEac3JdinAc](/img/FJ95b4S4voMavqxFWEac3JdinAc.png)

1. 展開が成功すると、以下が表示されます。

    ![QNHubedZWoJFe7xkX5ac5TOInzg](/img/QNHubedZWoJFe7xkX5ac5TOInzg.png)

1. 「リソースに移動」をクリックして、作成されたプライベートエンドポイントの概要ページを表示してください。

1. 「概要」ページの右上隅にある「JSONビュー」をクリックしてください。「接続ステータス」は「保留中」と表示されていることに注意してください。 

    ![YYrobZKr4oFJJ8xNRYicL2PZnde](/img/YYrobZKr4oFJJ8xNRYicL2PZnde.png)

    **リソースJSON**パネルで、`name`と`properties.resourceGuid`の値をコピーしてください。エンドポイントIDは、これら2つの値にピリオド(`.`)を加えたものである必要があります。 

    ![Vm7pbEGggo2tx6xirE3c9ZyRnSg](/img/Vm7pbEGggo2tx6xirE3c9ZyRnSg.png)

    たとえば、キー`name`の値は`zilliz`であり、キー`properties.resourceGuid`の値は`d73e9b55-7b9c-4f8d-8f0a-40e737f1ccbf`です。プライベートエンドポイントIDは`zilliz.d73e9b55-7b9c-4f8d-8f0a-40e737f1ccbf`である必要があります。

### エンドポイントを承認する{#authorize-your-endpoint}

Azureコンソールから取得したエンドポイントIDをZilliz Cloudの**Endpoint ID**ボックスに貼り付けます。**作成**をクリックしてください。

## プライベートリンクを取得する{#obtain-a-private-link}

送信した属性を確認して承認した後、Zilliz Cloudはこのエンドポイントにプライベートリンクを割り当てます。この過程には約5分かかります。 

プライベートリンクが準備できたら、Zilliz Cloudの**プライベートリンク**ページから閲覧可能です。

## DNSの設定{#set-up-dns}

Zilliz Cloudが割り当てたプライベートリンクを使用してクラスタをアクセス可能にする前に、DNSを設定する必要があります。

### AzureポータルでプライベートDNSゾーンを作成する{#create-a-private-dns-zone-on-the-azure-portal}

1. 作成されたプライベートエンドポイントの「概要」ページで、「設定」>「DNS構成」を選択し、プライベートエンドポイントと一緒に作成されたネットワークインターフェイスの「IPアドレス」をコピーしてください。

    ![GC9jbsUp2oXgCZxkojbcrmJanJb](/img/GC9jbsUp2oXgCZxkojbcrmJanJb.png)

    上のスクリーンショットの例の値は**10.0.0.4**です。

1. [プライベートDNSゾーンを作成する](https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.Network%2FprivateDnsZones)に移動し、**+Create**をクリックしてプロセスを開始します。

1. 「基本」タブで、上記で使用したサブスクリプションとリソースグループを選択し、Zilliz CloudコンソールからコピーしたプライベートリンクURIを「インスタンスの詳細」>「名前」に貼り付けます。次に、「作成の確認」をクリックします。

    ![QweWbLRSioY9Cix8nMUc0Q75n1e](/img/QweWbLRSioY9Cix8nMUc0Q75n1e.png)

1. 検証が完了したら、作成をクリックして過程を開始します。

    ![LsmabNzrwoz9lvxJpKac2gEdnGG](/img/LsmabNzrwoz9lvxJpKac2gEdnGG.png)

1. デプロイが成功した場合、以下が表示されます。

    ![LGB3bC80FoQnXIxx527cVkTMnAe](/img/LGB3bC80FoQnXIxx527cVkTMnAe.png)

1. 作成されたプライベートDNSゾーンの概要ページを表示するには、「リソースに移動」をクリックしてください。

    ![M401b0RiNoauaHxbBH6crLXlnXc](/img/M401b0RiNoauaHxbBH6crLXlnXc.png)

### プライベートDNSゾーンを仮想ネットワークにリンクします。{#link-the-private-dns-zone-to-your-virtual-network}

1. 作成したプライベートDNSゾーンの概要ページで、左側のナビゲーションペインで**設定**>**DNS管理**を選択してください。

1. 「+追加」をクリックしてください。「仮想ネットワークリンクの追加」ダイアログボックスで、「リンク名」を入力し、上記で使用した「サブスクリプション」と「仮想ネットワーク」を選択してください。「構成」セクションでも、「自動登録を有効にする」を選択してください。

    ![KQZ2bvbbUodBlAxV98ccbrwxnWg](/img/KQZ2bvbbUodBlAxV98ccbrwxnWg.png)

    すべてが期待どおりに設定されたら、「OK」をクリックして続行します。デプロイが成功すると、作成された仮想ネットワークリンクのリンクステータスが「完了」に変わります。

    ![R84pbAxcKo24pDxQvlKcyxV7n4b](/img/R84pbAxcKo24pDxQvlKcyxV7n4b.png)

1. 左ナビゲーションペインの**概要**をクリックして、プライベートDNSゾーンの**概要**ページに戻ります。

    ![S4bTb3ICwoWnlgxqSFrcYwEInvh](/img/S4bTb3ICwoWnlgxqSFrcYwEInvh.png)

1. 「+レコードセット」をクリックしてください。「レコードセットの追加」ダイアログボックスで、「名前」に`-privatelink`を付加したクラスターIDを入力し、「タイプ」で「A-アドレスレコード」を選択し、「TTL」を「10分」に設定してください。リストされたIPアドレスがメモしたものかどうかを確認してください。

    ![DtFQb18jloG9JDxYg0AcSlRsn75](/img/DtFQb18jloG9JDxYg0AcSlRsn75.png)

    レコードセットを保存するには、**OK**をクリックしてください。

    ![YWSZbd4qEoAW64xf9gHcamC8nyd](/img/YWSZbd4qEoAW64xf9gHcamC8nyd.png)

1. Azureポータルで作成されたプライベートエンドポイントの概要ページに戻ると、プライベートエンドポイントの「接続ステータス」が「保留中」から「承認済み」に変わることがわかります。 

    ![CqAEbOjDUogQGdxl3gjclaPAn1e](/img/CqAEbOjDUogQGdxl3gjclaPAn1e.png)

    Azure仮想ネットワーク内のリソースは、Zilliz Cloudクラスターにプライベートでアクセス可能になりました。

## クラスタへのインターネットアクセスを管理する{#manage-internet-access-to-your-clusters}

プライベートエンドポイントを設定した後、クラスターのパブリックエンドポイントを無効にして、プロジェクトへのインターネットアクセスを制限することができます。パブリックエンドポイントを無効にすると、ユーザーはプライベートリンクを使用してクラスターにのみ接続できます。

パブリックエンドポイントを無効にするには:

1. ターゲットクラスターの**クラスターの詳細**ページに移動してください。

1. 「接続」セクションに移動してください。

1. クラスターパブリックエンドポイントの横にある構成アイコンをクリックしてください。

1. 情報を読んで、「パブリックエンドポイントを無効にする」ダイアログボックスで「無効にする」をクリックしてください。

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>プライベートエンドポイントは<a href="/reference/restful/data-plane-v2">データプレーン</a>へのアクセスにのみ影響します。<a href="/reference/restful/control-plane-v2">コントロールプレーン</a>はパブリックインターネットを介してアクセスできます。</p></li>
<li><p>パブリックエンドポイントを再度有効にした後、ローカルDNSキャッシュの有効期限が切れるまで、パブリックエンドポイントにアクセス可能にする必要がある場合があります。</p></li>
</ul>

</Admonition>

![disable_public_endpoint](/img/disable_public_endpoint.png)

