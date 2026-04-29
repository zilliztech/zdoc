---
title: "Private Link の設定 (Azure) | Cloud"
slug: /setup-a-private-link-azure
sidebar_key: setup-a-private-link-azure
sidebar_label: "Private Link の設定 (Azure)"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud クラスターから異なる Microsoft Azure VPC でホストされているサービスへ Private Link を設定する手順を示します。| Cloud"
type: origin
token: W2fZwrrhVibvpGkd0MbcQGJQnib
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - private link
  - privatelink
  - private endpoint
  - private service connect
  - aws
  - gcp
  - azure

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Set up a プライベート Link (Azure)

このガイドでは、Zilliz Cloud クラスターから、異なる Microsoft Azure VPC でホストされているサービスへのプライベートリンクを設定する手順を示します。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は<strong>Dedicated</strong>クラスターでのみ利用可能です。</p>

</Admonition>

プライベートリンクはプロジェクトレベルで設定され、このプロジェクト下の同じクラウドプロバイダーおよびリージョンにデプロイされたすべてのクラスターに対して有効になります。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud はプライベートリンクに対して課金しません。ただし、クラウドプロバイダーは Zilliz Cloud にアクセスするために作成する<a href="https://azure.microsoft.com/en-us/pricing/details/private-link/">各エンドポイントに対して課金する場合があります</a>。</p>

</Admonition>

## 開始前に\{#before-you-start}

以下の条件が満たされていることを確認してください。

- このガイドで作成されるプライベートエンドポイントはグローバルにアクセス可能であることに注意してください。ターゲットの Zilliz Cloud クラスターとは異なるリージョンにあるサービスでも、クラスターに接続できます。

## プライベートエンドポイントの作成\{#create-private-endpoint}

Zilliz Cloud は、プライベートエンドポイントを追加するための直感的な Web コンソールを提供しています。ターゲットプロジェクトに移動し、左側のナビゲーションで**ネットワーク > プライベートエンドポイント**をクリックします。**+ プライベートエンドポイント**をクリックします。

![PYylbfopjoFkiZxFlbucIFHkn8g](https://zdoc-images.s3.us-west-2.amazonaws.com/pyylbfopjofkizxflbucifhkn8g.png "PYylbfopjoFkiZxFlbucIFHkn8g")

### ステップ 1: クラウドプロバイダーとリージョンの選択\{#step-1-select-a-cloud-provider-and-region}

Azure リージョンにデプロイされたクラスターのプライベートエンドポイントを作成するには、**クラウドプロバイダー**ドロップダウンリストから**Azure**を選択します。**リージョン**で、 privately アクセスしたいクラスターが存在するリージョンを選択します。**次へ**をクリックします。

利用可能なクラウドプロバイダーとリージョンの詳細については、[クラウドプロバイダーとリージョン](./cloud-providers-and-regions) を参照してください。

![CguAbg90loxAJ4x0cl6c58rqnvO](https://zdoc-images.s3.us-west-2.amazonaws.com/cguabg90loxaj4x0cl6c58rqnvo.png "CguAbg90loxAJ4x0cl6c58rqnvO")

### ステップ 2: エンドポイントサービスの確立\{#step-2-establish-an-endpoint-service}

![Z54SboHLyoKB1QxAG4Dcw7bEnOh](https://zdoc-images.s3.us-west-2.amazonaws.com/z54sbohlyokb1qxag4dcw7benoh.png "Z54SboHLyoKB1QxAG4Dcw7bEnOh")

[Microsoft Azure サブスクリプションページ](https://portal.azure.com/#view/Microsoft_Azure_請求/SubscriptionsBladeV1) からコピーしたサブスクリプション ID を入力します。以下に例を示します。

![KmCYbkbpDoJHAkxDzN9cV1LOnng](https://zdoc-images.s3.us-west-2.amazonaws.com/kmcybkbpdojhakxdzn9cv1lonng.png "KmCYbkbpDoJHAkxDzN9cV1LOnng")

### ステップ 3: エンドポイントの作成\{#step-3-create-an-endpoint}

このステップはクラウドプロバイダーのコンソールで完了する必要があります。

<Procedures>

1. [プライベート Link Center](https://portal.azure.com/#view/Microsoft_Azure_ネットワーク/プライベートLinkCenterBlade/~/privateendpoints) に移動し、**+ 作成**をクリックします。

    ![TQB9bT5KKojscoxcOZbcZ4Q6nNf](https://zdoc-images.s3.us-west-2.amazonaws.com/tqb9bt5kkojscoxcozbcz4q6nnf.png "TQB9bT5KKojscoxcOZbcZ4Q6nNf")

1. 作成するプライベートエンドポイントの基本情報を入力します。

    ![ECcPbN4Kaog5bdxyed3cyP3HnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/eccpbn4kaog5bdxyed3cyp3hnhe.png "ECcPbN4Kaog5bdxyed3cyP3HnHe")

1. **次へ：リソース >** をクリックし、**リソース ID またはエイリアスによって Azure リソースに接続**を選択します。次に、Zilliz Cloud コンソールからコピーしたものを**リソース ID またはエイリアス**に貼り付けます。

    ![TDJVb0pkWoxVPIxCThvct9Hpnae](https://zdoc-images.s3.us-west-2.amazonaws.com/tdjvb0pkwoxvpixcthvct9hpnae.png "TDJVb0pkWoxVPIxCThvct9Hpnae")

1. **仮想ネットワーク**と**サブネット**で適切な値を選択し、このタブの他の設定はデフォルトのままにします。

    ![SNdZbzo0EoP7PYxg1z4clUijnQg](https://zdoc-images.s3.us-west-2.amazonaws.com/sndzbzo0eop7pyxg1z4cluijnqg.png "SNdZbzo0EoP7PYxg1z4clUijnQg")

1. **レビュー + 作成**タブに到達するまで**次へ**をクリックします。検証に合格したら、**作成**をクリックしてプライベートエンドポイントを作成します。

    ![FJ95b4S4voMavqxFWEac3JdinAc](https://zdoc-images.s3.us-west-2.amazonaws.com/fj95b4s4vomavqxfweac3jdinac.png "FJ95b4S4voMavqxFWEac3JdinAc")

1. デプロイが成功すると、以下のように表示されます。

    ![QNHubedZWoJFe7xkX5ac5TOInzg](https://zdoc-images.s3.us-west-2.amazonaws.com/qnhubedzwojfe7xkx5ac5toinzg.png "QNHubedZWoJFe7xkX5ac5TOInzg")

1. **リソースに移動**をクリックし、作成されたプライベートエンドポイントの概要ページを表示します。

1. **概要**ページの右上隅にある**JSON ビュー**をクリックします。**接続ステータス**が**保留中**として表示されていることに注意してください。

    ![YYrobZKr4oFJJ8xNRYicL2PZnde](https://zdoc-images.s3.us-west-2.amazonaws.com/yyrobzkr4ofjj8xnryicl2pznde.png "YYrobZKr4oFJJ8xNRYicL2PZnde")

    **リソース JSON**パネルで、`name` と `properties.resourceGuid` の値をコピーします。エンドポイント ID は、これら 2 つの値をピリオド（`.`）で結合したものになります。

    ![Vm7pbEGggo2tx6xirE3c9ZyRnSg](https://zdoc-images.s3.us-west-2.amazonaws.com/vm7pbegggo2tx6xire3c9zyrnsg.png "Vm7pbEGggo2tx6xirE3c9ZyRnSg")

    例えば、キー `name` の値が `zilliz` で、キー `properties.resourceGuid` の値が `d73e9b55-7b9c-4f8d-8f0a-40e737f1ccbf` の場合、プライベートエンドポイント ID は `zilliz.d73e9b55-7b9c-4f8d-8f0a-40e737f1ccbf` になります。

</Procedures>

### ステップ 4: エンドポイントの承認\{#step-4-authorize-your-endpoint}

Azure コンソールから取得したエンドポイント ID を、Zilliz Cloud の**エンドポイント ID**ボックスに貼り付けます。**作成**をクリックします。

## プライベートリンクの取得\{#obtain-a-private-link}

送信した前述の属性を確認および承認した後、Zilliz Cloud はこのエンドポイント用にプライベートリンクを割り当てます。このプロセスには約 5 分かかります。

プライベートリンクの準備が整うと、Zilliz Cloud の**プライベートリンク**ページで確認できます。

## DNS の設定\{#set-up-dns}

Zilliz Cloud によって割り当てられたプライベートリンク経由でクラスターにアクセスする前に、DNS を設定する必要があります。

### ステップ 1: Azure ポータルでプライベート DNS ゾーンの作成\{#step-1-create-a-private-dns-zone-on-the-azure-portal}

<Procedures>

1. 作成されたプライベートエンドポイントの**概要**ページで、**設定** > **DNS 設定**を選択し、プライベートエンドポイントと共に作成されたネットワークインターフェースの**IP アドレス**をコピーします。

    ![GC9jbsUp2oXgCZxkojbcrmJanJb](https://zdoc-images.s3.us-west-2.amazonaws.com/gc9jbsup2oxgczxkojbcrmjanjb.png "GC9jbsUp2oXgCZxkojbcrmJanJb")

    上記のスクリーンショットの例の値は**10.0.0.4**です。

1. [プライベート DNS ゾーンの作成](https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.ネットワーク%2FprivateDnsZones) に移動し、**+ 作成**をクリックしてプロセスを開始します。

1. **基本**タブで、上記で使用したサブスクリプションとリソースグループを選択し、Zilliz Cloud コンソールからコピーしたプライベートリンク URI を**インスタンスの詳細** > **名前**に貼り付けます。次に、**レビュー + 作成**をクリックします。

    ![QweWbLRSioY9Cix8nMUc0Q75n1e](https://zdoc-images.s3.us-west-2.amazonaws.com/qwewblrsioy9cix8nmuc0q75n1e.png "QweWbLRSioY9Cix8nMUc0Q75n1e")

1. 検証に合格したら、作成をクリックしてプロセスを開始します。

    ![LsmabNzrwoz9lvxJpKac2gEdnGG](https://zdoc-images.s3.us-west-2.amazonaws.com/lsmabnzrwoz9lvxjpkac2gedngg.png "LsmabNzrwoz9lvxJpKac2gEdnGG")

1. デプロイが成功すると、以下のように表示されます。

    ![LGB3bC80FoQnXIxx527cVkTMnAe](https://zdoc-images.s3.us-west-2.amazonaws.com/lgb3bc80foqnxixx527cvktmnae.png "LGB3bC80FoQnXIxx527cVkTMnAe")

1. **リソースに移動**をクリックし、作成されたプライベート DNS ゾーンの**概要**ページを表示します。

    ![M401b0RiNoauaHxbBH6crLXlnXc](https://zdoc-images.s3.us-west-2.amazonaws.com/m401b0rinoauahxbbh6crlxlnxc.png "M401b0RiNoauaHxbBH6crLXlnXc")

</Procedures>

### ステップ 2: プライベート DNS ゾーンを仮想ネットワークにリンクする\{#step-2-link-the-private-dns-zone-to-your-virtual-network}

<Procedures>

1. 作成されたプライベート DNS ゾーンの概要ページで、左側のナビゲーションペインから**設定** > **DNS 管理**を選択します。

1. **+ 追加**をクリックします。**仮想ネットワークリンクの追加**ダイアログボックスで、**リンク名**を入力し、上記で使用した**サブスクリプション**と**仮想ネットワーク**を選択します。**設定**セクションで、**自動登録を有効にする**も選択します。

    ![KQZ2bvbbUodBlAxV98ccbrwxnWg](https://zdoc-images.s3.us-west-2.amazonaws.com/kqz2bvbbuodblaxv98ccbrwxnwg.png "KQZ2bvbbUodBlAxV98ccbrwxnWg")

    すべての設定が期待通りになったら、**OK**をクリックして続行します。デプロイが成功すると、作成された仮想ネットワークリンクのリンクステータスが**完了**に変更されます。

    ![R84pbAxcKo24pDxQvlKcyxV7n4b](https://zdoc-images.s3.us-west-2.amazonaws.com/r84pbaxcko24pdxqvlkcyxv7n4b.png "R84pbAxcKo24pDxQvlKcyxV7n4b")

1. 左側のナビゲーションペインで**概要**をクリックし、プライベート DNS ゾーンの**概要**ページに戻ります。

    ![S4bTb3ICwoWnlgxqSFrcYwEInvh](https://zdoc-images.s3.us-west-2.amazonaws.com/s4btb3icwownlgxqsfrcyweinvh.png "S4bTb3ICwoWnlgxqSFrcYwEInvh")

1. **+ レコードセット**をクリックします。**レコードセットの追加**ダイアログボックスで、**名前**にクラスター ID に `-privatelink` を付加した値を入力し、**種類**で**A - アドレスレコード**を選択し、**TTL**を**10 分**に設定します。一覧表示された IP アドレスがメモしたものであるか確認します。

    ![DtFQb18jloG9JDxYg0AcSlRsn75](https://zdoc-images.s3.us-west-2.amazonaws.com/dtfqb18jlog9jdxyg0acslrsn75.png "DtFQb18jloG9JDxYg0AcSlRsn75")

    **OK**をクリックしてレコードセットを保存します。

    ![YWSZbd4qEoAW64xf9gHcamC8nyd](https://zdoc-images.s3.us-west-2.amazonaws.com/ywszbd4qeoaw64xf9ghcamc8nyd.png "YWSZbd4qEoAW64xf9gHcamC8nyd")

1. Azure ポータルの作成されたプライベートエンドポイントの概要ページに戻ると、プライベートエンドポイントの**接続ステータス**が**保留中**から**承認済み**に変わっていることがわかります。

    ![CqAEbOjDUogQGdxl3gjclaPAn1e](https://zdoc-images.s3.us-west-2.amazonaws.com/cqaebojduogqgdxl3gjclapan1e.png "CqAEbOjDUogQGdxl3gjclaPAn1e")

    これで、Azure 仮想ネットワーク内のリソースは Zilliz Cloud クラスターにプライベートにアクセスできるようになります。

</Procedures>

## クラスターへのインターネットアクセスの管理\{#manage-internet-access-to-your-clusters}

プライベートエンドポイントを構成した後、プロジェクトへのインターネットアクセスを制限するために、クラスターのパブリックエンドポイントを無効化することを選択できます。パブリックエンドポイントを無効化すると、ユーザーはプライベートリンクを使用してのみクラスターに接続できるようになります。

パブリックエンドポイントを無効化するには：

<Procedures>

1. ターゲットクラスターの**クラスターの詳細**ページに移動します。

1. **接続**セクションに移動します。

1. クラスターのパブリックエンドポイントの横にある設定アイコンをクリックします。

1. 情報を読み、**パブリックエンドポイントの無効化**ダイアログボックスで**無効化**をクリックします。

</Procedures>

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>プライベートエンドポイントは<a href="/reference/restful/data-plane-v2">データプレーン</a>アクセスのみに影響します。<a href="/reference/restful/control-plane-v2">コントロールプレーン</a>は引き続きパブリックインターネット経由でアクセスできます。</p></li>
<li><p>パブリックエンドポイントを再度有効にした後、パブリックエンドポイントにアクセスできるようになるまで、ローカル DNS キャッシュの有効期限が切れるのを待つ必要がある場合があります。</p></li>
</ul>

</Admonition>

![disable_public_endpoint](https://zdoc-images.s3.us-west-2.amazonaws.com/disable_public_endpoint.png "disable_public_endpoint")

## よくある質問\{#faq}

### 既存のクラスター用にプライベートエンドポイントを作成できますか？\{#can-i-create-a-private-endpoint-for-an-existing-cluster}

はい。プライベートエンドポイントを作成すると、同じリージョンおよびプロジェクトに存在するすべての既存および将来の Dedicated (Enterprise) クラスターに有効になります。必要なことは、異なるクラスターごとに異なる DNS レコードを追加することだけです。