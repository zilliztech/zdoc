---
title: "Private Link を設定する（Azure） | Cloud"
slug: /setup-a-private-link-azure
sidebar_label: "Private Link を設定する（Azure）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、異なる Microsoft Azure VPC でホストされているお客様のサービスに対して、Zilliz Cloud クラスターからプライベートリンクを設定する手順を示します。| Cloud"
type: origin
token: W2fZwrrhVibvpGkd0MbcQGJQnib
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Private Link を設定する（Azure）

このガイドでは、異なる Microsoft Azure VPC でホストされているお客様のサービスに対して、Zilliz Cloud クラスターからプライベートリンクを設定する手順を示します。

プライベートリンクはプロジェクトレベルで設定され、このプロジェクト配下で同じクラウドプロバイダーおよびリージョンにデプロイされたすべての **Dedicated** サービングクラスターと **on-demand** クラスターに有効です。

<Admonition type="info" icon="📘" title="Note">

プロジェクトごとに最大 10 個のプライベートエンドポイントを作成できます。

</Admonition>

Zilliz Cloud はプライベートエンドポイントの作成および使用に対して料金を請求しません。ただし、Zilliz Cloud にアクセスするために作成する各エンドポイントに対して、クラウドプロバイダーから[料金が請求される](https://aws.amazon.com/privatelink/pricing/)場合があります。

## 開始前に\{#before-you-start}

以下の条件を満たしていることを確認してください。

- このガイドで作成するプライベートエンドポイントはグローバルにアクセス可能である点に注意してください。対象の Zilliz Cloud クラスターとは異なるリージョンにあるお客様のサービスからでも、そのクラスターに接続できます。

## プライベートエンドポイントを作成する\{#create-private-endpoint}

Zilliz Cloud では、直感的な Web コンソールを使用してプライベートエンドポイントを追加できます。対象のプロジェクトに移動し、左側のナビゲーションで **Network > Private Endpoint** をクリックします。次に **+ Private Endpoint** をクリックします。

![PYylbfopjoFkiZxFlbucIFHkn8g](https://zdoc-images.s3.us-west-2.amazonaws.com/pyylbfopjofkizxflbucifhkn8g.png "PYylbfopjoFkiZxFlbucIFHkn8g")

### ステップ 1: クラウドプロバイダーとリージョンを選択する\{#step-1-select-a-cloud-provider-and-region}

Azure リージョンにデプロイされたクラスター用のプライベートエンドポイントを作成するには、**Cloud Provider** ドロップダウンリストから **Azure** を選択します。**Region** では、プライベートにアクセスしたいクラスターが配置されているリージョンを選択します。**Next** をクリックします。 

利用可能なクラウドプロバイダーとリージョンの詳細については、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。 

![CguAbg90loxAJ4x0cl6c58rqnvO](https://zdoc-images.s3.us-west-2.amazonaws.com/cguabg90loxaj4x0cl6c58rqnvo.png "CguAbg90loxAJ4x0cl6c58rqnvO")

### ステップ 2: エンドポイントサービスを確立する\{#step-2-establish-an-endpoint-service}

![Z54SboHLyoKB1QxAG4Dcw7bEnOh](https://zdoc-images.s3.us-west-2.amazonaws.com/z54sbohlyokb1qxag4dcw7benoh.png "Z54SboHLyoKB1QxAG4Dcw7bEnOh")

[Microsoft Azure Subscription page](https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBladeV1) からコピーしたサブスクリプション ID を入力します。以下は例です。

![KmCYbkbpDoJHAkxDzN9cV1LOnng](https://zdoc-images.s3.us-west-2.amazonaws.com/kmcybkbpdojhakxdzn9cv1lonng.png "KmCYbkbpDoJHAkxDzN9cV1LOnng")

### ステップ 3: エンドポイントを作成する\{#step-3-create-an-endpoint}

このステップはクラウドプロバイダーのコンソールで完了する必要があります。

<Procedures>

1. [Private Link Center](https://portal.azure.com/#view/Microsoft_Azure_Network/PrivateLinkCenterBlade/~/privateendpoints) に移動し、**+ Create** をクリックします。

    ![TQB9bT5KKojscoxcOZbcZ4Q6nNf](https://zdoc-images.s3.us-west-2.amazonaws.com/tqb9bt5kkojscoxcozbcz4q6nnf.png "TQB9bT5KKojscoxcOZbcZ4Q6nNf")

1. 作成するプライベートエンドポイントの基本情報を入力します。

    ![ECcPbN4Kaog5bdxyed3cyP3HnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/eccpbn4kaog5bdxyed3cyp3hnhe.png "ECcPbN4Kaog5bdxyed3cyP3HnHe")

1. **Next: Resource >** をクリックし、**Connect to an Azure resource by resource ID or alias** を選択します。その後、Zilliz Cloud コンソールからコピーしたものを **Resource ID or alias** に貼り付けます。

    ![TDJVb0pkWoxVPIxCThvct9Hpnae](https://zdoc-images.s3.us-west-2.amazonaws.com/tdjvb0pkwoxvpixcthvct9hpnae.png "TDJVb0pkWoxVPIxCThvct9Hpnae")

1. **Virtual network** と **Subnet** に適切な値を選択し、このタブのその他の設定はデフォルトのままにします。

    ![SNdZbzo0EoP7PYxg1z4clUijnQg](https://zdoc-images.s3.us-west-2.amazonaws.com/sndzbzo0eop7pyxg1z4cluijnqg.png "SNdZbzo0EoP7PYxg1z4clUijnQg")

1. **Review + create** タブに到達するまで **Next** をクリックします。検証に成功したら、**Create** をクリックしてプライベートエンドポイントを作成します。

    ![FJ95b4S4voMavqxFWEac3JdinAc](https://zdoc-images.s3.us-west-2.amazonaws.com/fj95b4s4vomavqxfweac3jdinac.png "FJ95b4S4voMavqxFWEac3JdinAc")

1. デプロイが成功すると、次のように表示されます。

    ![QNHubedZWoJFe7xkX5ac5TOInzg](https://zdoc-images.s3.us-west-2.amazonaws.com/qnhubedzwojfe7xkx5ac5toinzg.png "QNHubedZWoJFe7xkX5ac5TOInzg")

1. **Go to resource** をクリックして、作成した Private Endpoint の概要ページを表示します。

1. **Overview** ページの右上にある **JSON View** をクリックします。**Connection Status** が **Pending** と表示されていることに注意してください。 

    ![YYrobZKr4oFJJ8xNRYicL2PZnde](https://zdoc-images.s3.us-west-2.amazonaws.com/yyrobzkr4ofjj8xnryicl2pznde.png "YYrobZKr4oFJJ8xNRYicL2PZnde")

    **Resource JSON** パネルで、`name` と `properties.resourceGuid` の値をコピーします。エンドポイント ID は、これら 2 つの値をピリオド（`.`）で連結したものになります。 

    ![Vm7pbEGggo2tx6xirE3c9ZyRnSg](https://zdoc-images.s3.us-west-2.amazonaws.com/vm7pbegggo2tx6xire3c9zyrnsg.png "Vm7pbEGggo2tx6xirE3c9ZyRnSg")

    たとえば、キー `name` の値が `zilliz` で、キー `properties.resourceGuid` の値が `d73e9b55-7b9c-4f8d-8f0a-40e737f1ccbf` の場合、Private Endpoint ID は `zilliz.d73e9b55-7b9c-4f8d-8f0a-40e737f1ccbf` になります。

</Procedures>

### ステップ 4: エンドポイントを認可する\{#step-4-authorize-your-endpoint}

Azure コンソールから取得したエンドポイント ID を、Zilliz Cloud 上の **Endpoint ID** ボックスに貼り付けます。**Create** をクリックします。

## プライベートリンクを取得する\{#obtain-a-private-link}

送信した前述の属性が検証および承認されると、Zilliz Cloud はこのエンドポイントにプライベートリンクを割り当てます。この処理には約 5 分かかります。 

プライベートリンクの準備ができると、Zilliz Cloud の **Private Link** ページで確認できます。

## DNS を設定する\{#set-up-dns}

Zilliz Cloud によって割り当てられたプライベートリンク経由でクラスターにアクセスする前に、DNS を設定する必要があります。

### ステップ 1: Azure portal で Private DNS Zone を作成する\{#step-1-create-a-private-dns-zone-on-the-azure-portal}

<Procedures>

1. 作成した Private Endpoint の **Overview** ページで、**Settings** > **DNS configuration** を選択し、Private Endpoint とともに作成されたネットワークインターフェイスの **IP address** をコピーします。

    ![GC9jbsUp2oXgCZxkojbcrmJanJb](https://zdoc-images.s3.us-west-2.amazonaws.com/gc9jbsup2oxgczxkojbcrmjanjb.png "GC9jbsUp2oXgCZxkojbcrmJanJb")

    上のスクリーンショットの例の値は **10.0.0.4** です。

1. [Create a Private DNS zone](https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.Network%2FprivateDnsZones) に移動し、**+ Create** をクリックして処理を開始します。

1. **Basics** タブで、上で使用したサブスクリプションとリソースグループを選択し、Zilliz Cloud コンソールからコピーした Private Link URI を **Instance details** > **Name** に貼り付けます。次に **Review create** をクリックします。

    ![QweWbLRSioY9Cix8nMUc0Q75n1e](https://zdoc-images.s3.us-west-2.amazonaws.com/qwewblrsioy9cix8nmuc0q75n1e.png "QweWbLRSioY9Cix8nMUc0Q75n1e")

1. 検証に成功したら、Create をクリックして処理を開始します。

    ![LsmabNzrwoz9lvxJpKac2gEdnGG](https://zdoc-images.s3.us-west-2.amazonaws.com/lsmabnzrwoz9lvxjpkac2gedngg.png "LsmabNzrwoz9lvxJpKac2gEdnGG")

1. デプロイが成功すると、次のように表示されます。

    ![LGB3bC80FoQnXIxx527cVkTMnAe](https://zdoc-images.s3.us-west-2.amazonaws.com/lgb3bc80foqnxixx527cvktmnae.png "LGB3bC80FoQnXIxx527cVkTMnAe")

1. **Go to resource** をクリックして、作成した Private DNS zone の **Overview** ページを表示します。

    ![M401b0RiNoauaHxbBH6crLXlnXc](https://zdoc-images.s3.us-west-2.amazonaws.com/m401b0rinoauahxbbh6crlxlnxc.png "M401b0RiNoauaHxbBH6crLXlnXc")

</Procedures>

### ステップ 2: Private DNS Zone を仮想ネットワークにリンクする。\{#step-2-link-the-private-dns-zone-to-your-virtual-network}

<Procedures>

1. 作成した Private DNS Zone の Overview ページで、左側のナビゲーションペインから **Settings** > **DNS Management** を選択します。

1. **+ Add** をクリックします。**Add virtual network link** ダイアログボックスで、**Link name** を入力し、上で使用した **Subscription** と **Virtual network** を選択します。**Configuration** セクションでは、**Enable auto registration** も選択します。

    ![KQZ2bvbbUodBlAxV98ccbrwxnWg](https://zdoc-images.s3.us-west-2.amazonaws.com/kqz2bvbbuodblaxv98ccbrwxnwg.png "KQZ2bvbbUodBlAxV98ccbrwxnWg")

    すべてが想定どおりに設定されたら、**OK** をクリックして続行します。デプロイが成功すると、作成した仮想ネットワークリンクのリンクステータスは **Completed** に変わります。

    ![R84pbAxcKo24pDxQvlKcyxV7n4b](https://zdoc-images.s3.us-west-2.amazonaws.com/r84pbaxcko24pdxqvlkcyxv7n4b.png "R84pbAxcKo24pDxQvlKcyxV7n4b")

1. 左側のナビゲーションペインで **Overview** をクリックし、Private DNS zone の **Overview** ページに戻ります。

    ![S4bTb3ICwoWnlgxqSFrcYwEInvh](https://zdoc-images.s3.us-west-2.amazonaws.com/s4btb3icwownlgxqsfrcyweinvh.png "S4bTb3ICwoWnlgxqSFrcYwEInvh")

1. **+ Record set** をクリックします。**Add record set** ダイアログボックスで、**Name** にクラスター ID の末尾に `-privatelink` を付けたものを入力し、**Type** で **A - Address record** を選択し、**TTL** を **10 Minutes** に設定します。表示されている IP アドレスが、メモしておいたものと一致するか確認してください。

    ![DtFQb18jloG9JDxYg0AcSlRsn75](https://zdoc-images.s3.us-west-2.amazonaws.com/dtfqb18jlog9jdxyg0acslrsn75.png "DtFQb18jloG9JDxYg0AcSlRsn75")

    **OK** をクリックしてレコードセットを保存します。

    ![YWSZbd4qEoAW64xf9gHcamC8nyd](https://zdoc-images.s3.us-west-2.amazonaws.com/ywszbd4qeoaw64xf9ghcamc8nyd.png "YWSZbd4qEoAW64xf9gHcamC8nyd")

1. Azure portal 上で、作成した Private Endpoint の Overview ページに戻ると、Private Endpoint の **Connection Status** が **Pending** から **Approved** に変わっていることを確認できます。 

    ![CqAEbOjDUogQGdxl3gjclaPAn1e](https://zdoc-images.s3.us-west-2.amazonaws.com/cqaebojduogqgdxl3gjclapan1e.png "CqAEbOjDUogQGdxl3gjclaPAn1e")

    これで、お客様の Azure 仮想ネットワーク内のリソースから Zilliz Cloud クラスターにプライベートにアクセスできるようになります。

</Procedures>

## クラスターへのインターネットアクセスを管理する\{#manage-internet-access-to-your-clusters}

プライベートエンドポイントを設定した後、プロジェクトへのインターネットアクセスを制限するために、クラスターのパブリックエンドポイントを無効化することもできます。パブリックエンドポイントを無効化すると、ユーザーはプライベートリンクを使用してのみクラスターに接続できるようになります。

パブリックエンドポイントを無効化するには、次の手順に従います。

<Procedures>

1. 対象クラスターの **Cluster Details** ページに移動します。

1. **Connection** セクションに移動します。

1. クラスターのパブリックエンドポイントの横にある設定アイコンをクリックします。

1. 情報を確認し、**Disable Public Endpoint** ダイアログボックスで **Disable** をクリックします。

</Procedures>

<Admonition type="info" icon="📘" title="📘 Notes">

- プライベートエンドポイントが影響するのは [data plane](/reference/restful/data-plane-v2) へのアクセスのみです。[control plane](/reference/restful/control-plane-v2) には引き続きパブリックインターネット経由でアクセスできます。

- パブリックエンドポイントを再度有効化した後、パブリックエンドポイントにアクセスできるようになるまで、ローカル DNS キャッシュの有効期限が切れるのを待つ必要がある場合があります。

</Admonition>

![disable_public_endpoint](https://zdoc-images.s3.us-west-2.amazonaws.com/disablepublicendpoint.png "disable_public_endpoint")

## FAQ\{#faq}

### 既存のクラスターに対してプライベートエンドポイントを作成できますか？\{#can-i-create-a-private-endpoint-for-an-existing-cluster}

はい。プライベートエンドポイントを作成すると、同じリージョンとプロジェクトに存在する既存および今後作成されるすべての Dedicated (Enterprise) クラスターに対して有効になります。必要なのは、異なるクラスターごとに異なる DNS レコードを追加することだけです。
