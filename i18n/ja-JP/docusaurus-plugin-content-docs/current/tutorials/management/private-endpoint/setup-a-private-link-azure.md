---
title: "Private Link（Azure）をセットアップする | Cloud"
slug: /setup-a-private-link-azure
sidebar_label: "Private Link（Azure）をセットアップする"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、異なる Microsoft Azure VPC でホストされているサービスに対して、Zilliz Cloud cluster から private link を設定する手順を説明します。 | Cloud"
type: origin
token: W2fZwrrhVibvpGkd0MbcQGJQnib
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Private Link（Azure）をセットアップする

このガイドでは、異なる Microsoft Azure VPC でホストされているサービスに対して、Zilliz Cloud cluster から private link を設定する手順を説明します。

private link は project レベルで設定され、この project 配下で同じ cloud provider と region にデプロイされたすべての **Dedicated** serving cluster および **on-demand** cluster に対して有効です。

<Admonition type="info" icon="📘" title="Note">

project ごとに最大 10 個の private endpoint を作成できます。

</Admonition>

Zilliz Cloud は private endpoint の作成および利用に対して課金しません。ただし、Zilliz Cloud へアクセスするために作成する各 endpoint に対して、cloud provider が[料金を請求する](https://aws.amazon.com/privatelink/pricing/)場合があります。

## 始める前に\{#before-you-start}

以下の条件を満たしていることを確認してください。

- このガイドで作成する private endpoint はグローバルにアクセス可能です。対象の Zilliz Cloud cluster とは異なる region にあるサービスからでも、その cluster に接続できます。

## private endpoint を作成する\{#create-private-endpoint}

Zilliz Cloud では、直感的な Web コンソールを使用して private endpoint を追加できます。対象の project に移動し、左側のナビゲーションで **Network > Private Endpoint** をクリックします。**+ Private Endpoint** をクリックします。

![PYylbfopjoFkiZxFlbucIFHkn8g](https://zdoc-images.s3.us-west-2.amazonaws.com/pyylbfopjofkizxflbucifhkn8g.png "PYylbfopjoFkiZxFlbucIFHkn8g")

### ステップ 1: cloud provider と region を選択する\{#step-1-select-a-cloud-provider-and-region}

Azure region にデプロイされた cluster 用の private endpoint を作成するには、**Cloud Provider** のドロップダウンリストから **Azure** を選択します。**Region** では、private にアクセスしたい cluster が配置されている region を選択します。**Next** をクリックします。 

利用可能な cloud provider と region の詳細については、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。 

![CguAbg90loxAJ4x0cl6c58rqnvO](https://zdoc-images.s3.us-west-2.amazonaws.com/cguabg90loxaj4x0cl6c58rqnvo.png "CguAbg90loxAJ4x0cl6c58rqnvO")

### ステップ 2: endpoint service を確立する\{#step-2-establish-an-endpoint-service}

![Z54SboHLyoKB1QxAG4Dcw7bEnOh](https://zdoc-images.s3.us-west-2.amazonaws.com/z54sbohlyokb1qxag4dcw7benoh.png "Z54SboHLyoKB1QxAG4Dcw7bEnOh")

[Microsoft Azure Subscription page](https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBladeV1) からコピーした subscription ID を入力します。以下はその例です。

![KmCYbkbpDoJHAkxDzN9cV1LOnng](https://zdoc-images.s3.us-west-2.amazonaws.com/kmcybkbpdojhakxdzn9cv1lonng.png "KmCYbkbpDoJHAkxDzN9cV1LOnng")

### ステップ 3: endpoint を作成する\{#step-3-create-an-endpoint}

このステップは、cloud provider のコンソール上で完了する必要があります。

<Procedures>

1. [Private Link Center](https://portal.azure.com/#view/Microsoft_Azure_Network/PrivateLinkCenterBlade/~/privateendpoints) に移動し、**+ Create** をクリックします。

    ![TQB9bT5KKojscoxcOZbcZ4Q6nNf](https://zdoc-images.s3.us-west-2.amazonaws.com/tqb9bt5kkojscoxcozbcz4q6nnf.png "TQB9bT5KKojscoxcOZbcZ4Q6nNf")

1. 作成する private endpoint の基本情報を入力します。

    ![ECcPbN4Kaog5bdxyed3cyP3HnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/eccpbn4kaog5bdxyed3cyp3hnhe.png "ECcPbN4Kaog5bdxyed3cyP3HnHe")

1. **Next: Resource >** をクリックし、**Connect to an Azure resource by resource ID or alias** を選択します。その後、Zilliz Cloud コンソールからコピーしたものを **Resource ID or alias** に貼り付けます。

    ![TDJVb0pkWoxVPIxCThvct9Hpnae](https://zdoc-images.s3.us-west-2.amazonaws.com/tdjvb0pkwoxvpixcthvct9hpnae.png "TDJVb0pkWoxVPIxCThvct9Hpnae")

1. **Virtual network** と **Subnet** に適切な値を選択し、このタブ上のその他の設定はデフォルトのままにします。

    ![SNdZbzo0EoP7PYxg1z4clUijnQg](https://zdoc-images.s3.us-west-2.amazonaws.com/sndzbzo0eop7pyxg1z4cluijnqg.png "SNdZbzo0EoP7PYxg1z4clUijnQg")

1. **Review + create** タブに到達するまで **Next** をクリックします。検証に成功したら、**Create** をクリックして private endpoint を作成します。

    ![FJ95b4S4voMavqxFWEac3JdinAc](https://zdoc-images.s3.us-west-2.amazonaws.com/fj95b4s4vomavqxfweac3jdinac.png "FJ95b4S4voMavqxFWEac3JdinAc")

1. デプロイが成功すると、以下のように表示されます。

    ![QNHubedZWoJFe7xkX5ac5TOInzg](https://zdoc-images.s3.us-west-2.amazonaws.com/qnhubedzwojfe7xkx5ac5toinzg.png "QNHubedZWoJFe7xkX5ac5TOInzg")

1. **Go to resource** をクリックし、作成された Private Endpoint の概要ページを表示します。

1. **Overview** ページの右上にある **JSON View** をクリックします。**Connection Status** が **Pending** と表示されていることに注意してください。 

    ![YYrobZKr4oFJJ8xNRYicL2PZnde](https://zdoc-images.s3.us-west-2.amazonaws.com/yyrobzkr4ofjj8xnryicl2pznde.png "YYrobZKr4oFJJ8xNRYicL2PZnde")

    **Resource JSON** パネルで、`name` と `properties.resourceGuid` の値をコピーします。endpoint ID は、これら 2 つの値をピリオド（`.`）で連結したものになります。 

    ![Vm7pbEGggo2tx6xirE3c9ZyRnSg](https://zdoc-images.s3.us-west-2.amazonaws.com/vm7pbegggo2tx6xire3c9zyrnsg.png "Vm7pbEGggo2tx6xirE3c9ZyRnSg")

    たとえば、キー `name` の値が `zilliz` で、キー `properties.resourceGuid` の値が `d73e9b55-7b9c-4f8d-8f0a-40e737f1ccbf` の場合、Private Endpoint ID は `zilliz.d73e9b55-7b9c-4f8d-8f0a-40e737f1ccbf` になります。

</Procedures>

### ステップ 4: endpoint を認可する\{#step-4-authorize-your-endpoint}

Azure コンソールから取得した endpoint ID を、Zilliz Cloud 上の **Endpoint ID** ボックスに貼り付けます。**Create** をクリックします。

## private link を取得する\{#obtain-a-private-link}

送信した前述の属性が検証および承認されると、Zilliz Cloud はこの endpoint 用の private link を割り当てます。このプロセスには約 5 分かかります。 

private link の準備ができると、Zilliz Cloud の **Private Link** ページで確認できます。

## DNS を設定する\{#set-up-dns}

Zilliz Cloud が割り当てた private link 経由で cluster にアクセスする前に、DNS を設定する必要があります。

### ステップ 1: Azure portal で Private DNS Zone を作成する\{#step-1-create-a-private-dns-zone-on-the-azure-portal}

<Procedures>

1. 作成した Private Endpoint の **Overview** ページで、**Settings** > **DNS configuration** を選択し、Private Endpoint とともに作成された network interface の **IP address** をコピーします。

    ![GC9jbsUp2oXgCZxkojbcrmJanJb](https://zdoc-images.s3.us-west-2.amazonaws.com/gc9jbsup2oxgczxkojbcrmjanjb.png "GC9jbsUp2oXgCZxkojbcrmJanJb")

    上のスクリーンショットの例の値は **10.0.0.4** です。

1. [Create a Private DNS zone](https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.Network%2FprivateDnsZones) に移動し、**+ Create** をクリックしてプロセスを開始します。

1. **Basics** タブで、上で使用した subscription と resource group を選択し、Zilliz Cloud コンソールからコピーした Private Link URI を **Instance details** > **Name** に貼り付けます。その後、**Review create** をクリックします。

    ![QweWbLRSioY9Cix8nMUc0Q75n1e](https://zdoc-images.s3.us-west-2.amazonaws.com/qwewblrsioy9cix8nmuc0q75n1e.png "QweWbLRSioY9Cix8nMUc0Q75n1e")

1. 検証に成功したら、Create をクリックしてプロセスを開始します。

    ![LsmabNzrwoz9lvxJpKac2gEdnGG](https://zdoc-images.s3.us-west-2.amazonaws.com/lsmabnzrwoz9lvxjpkac2gedngg.png "LsmabNzrwoz9lvxJpKac2gEdnGG")

1. デプロイが成功すると、以下のように表示されます。

    ![LGB3bC80FoQnXIxx527cVkTMnAe](https://zdoc-images.s3.us-west-2.amazonaws.com/lgb3bc80foqnxixx527cvktmnae.png "LGB3bC80FoQnXIxx527cVkTMnAe")

1. **Go to resource** をクリックして、作成された Private DNS zone の **Overview** ページを表示します。

    ![M401b0RiNoauaHxbBH6crLXlnXc](https://zdoc-images.s3.us-west-2.amazonaws.com/m401b0rinoauahxbbh6crlxlnxc.png "M401b0RiNoauaHxbBH6crLXlnXc")

</Procedures>

### ステップ 2: Private DNS Zone を virtual network にリンクする\{#step-2-link-the-private-dns-zone-to-your-virtual-network}

<Procedures>

1. 作成した Private DNS Zone の Overview ページで、左側のナビゲーションペインから **Settings** > **DNS Management** を選択します。

1. **+ Add** をクリックします。**Add virtual network link** ダイアログボックスで、**Link name** を入力し、上で使用した **Subscription** と **Virtual network** を選択します。**Configuration** セクションでは、**Enable auto registration** も選択します。

    ![KQZ2bvbbUodBlAxV98ccbrwxnWg](https://zdoc-images.s3.us-west-2.amazonaws.com/kqz2bvbbuodblaxv98ccbrwxnwg.png "KQZ2bvbbUodBlAxV98ccbrwxnWg")

    すべてが想定どおりに設定されたら、**OK** をクリックして続行します。デプロイが成功すると、作成された virtual network link のリンクステータスは **Completed** に変わります。

    ![R84pbAxcKo24pDxQvlKcyxV7n4b](https://zdoc-images.s3.us-west-2.amazonaws.com/r84pbaxcko24pdxqvlkcyxv7n4b.png "R84pbAxcKo24pDxQvlKcyxV7n4b")

1. 左側のナビゲーションペインで **Overview** をクリックし、Private DNS zone の **Overview** ページに戻ります。

    ![S4bTb3ICwoWnlgxqSFrcYwEInvh](https://zdoc-images.s3.us-west-2.amazonaws.com/s4btb3icwownlgxqsfrcyweinvh.png "S4bTb3ICwoWnlgxqSFrcYwEInvh")

1. **+ Record set** をクリックします。**Add record set** ダイアログボックスで、**Name** に `-privatelink` を接尾辞として付けた cluster ID を入力し、**Type** で **A - Address record** を選択し、**TTL** を **10 Minutes** に設定します。表示されている IP address が、先ほど控えたものと同じか確認してください。

    ![DtFQb18jloG9JDxYg0AcSlRsn75](https://zdoc-images.s3.us-west-2.amazonaws.com/dtfqb18jlog9jdxyg0acslrsn75.png "DtFQb18jloG9JDxYg0AcSlRsn75")

    **OK** をクリックして record set を保存します。

    ![YWSZbd4qEoAW64xf9gHcamC8nyd](https://zdoc-images.s3.us-west-2.amazonaws.com/ywszbd4qeoaw64xf9ghcamc8nyd.png "YWSZbd4qEoAW64xf9gHcamC8nyd")

1. Azure portal 上で、作成した Private Endpoint の Overview ページに戻ると、Private Endpoint の **Connection Status** が **Pending** から **Approved** に変わっていることが確認できます。 

    ![CqAEbOjDUogQGdxl3gjclaPAn1e](https://zdoc-images.s3.us-west-2.amazonaws.com/cqaebojduogqgdxl3gjclapan1e.png "CqAEbOjDUogQGdxl3gjclaPAn1e")

    これで、Azure virtual network 内のリソースは Zilliz Cloud cluster に private にアクセスできるようになります。

</Procedures>

## cluster へのインターネットアクセスを管理する\{#manage-internet-access-to-your-clusters}

private endpoint を設定した後、project へのインターネットアクセスを制限するために、cluster の public endpoint を無効化することを選択できます。public endpoint を無効化すると、ユーザーは private link を使用してのみ cluster に接続できるようになります。

public endpoint を無効化するには、以下の手順を実行します。

<Procedures>

1. 対象 cluster の **Cluster Details** ページに移動します。

1. **Connection** セクションに移動します。

1. cluster public endpoint の横にある設定アイコンをクリックします。

1. 情報を確認し、**Disable Public Endpoint** ダイアログボックスで **Disable** をクリックします。

</Procedures>

<Admonition type="info" icon="📘" title="📘 Notes">

- private endpoint は [data plane](/reference/restful/data-plane-v2) へのアクセスにのみ影響します。[Control plane](/reference/restful/control-plane-v2) には引き続きパブリックインターネット経由でアクセスできます。

- public endpoint を再度有効化した後、public endpoint にアクセスできるようになるまで、ローカル DNS キャッシュの有効期限が切れるのを待つ必要がある場合があります。

</Admonition>

![disable_public_endpoint](https://zdoc-images.s3.us-west-2.amazonaws.com/disable_public_endpoint.png "disable_public_endpoint")

## FAQ\{#faq}

### 既存の cluster に対して private endpoint を作成できますか？\{#can-i-create-a-private-endpoint-for-an-existing-cluster}

はい。private endpoint を作成すると、同じ region と project に存在する既存および今後作成されるすべての Dedicated (Enterprise) cluster に対して有効になります。必要なのは、異なる cluster ごとに異なる DNS レコードを追加することだけです。
