---
title: "Private Link (Azure) を設定する | Cloud"
slug: /setup-a-private-link-azure
sidebar_label: "Private Link (Azure) を設定する"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudクラスターから異なるMicrosoft Azure VPCでホストされているサービスへのプライベートリンクを設定する手順を示します。 | Cloud"
type: origin
token: YminwoNGmi0ECFktXDlcH44inOe
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
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing

---

import Admonition from '@theme/Admonition';


# Private Link (Azure) を設定する

このガイドでは、Zilliz Cloudクラスターから異なるMicrosoft Azure VPCでホストされているサービスへのプライベートリンクを設定する手順を示します。

この機能は、専用(エンタープライズ)クラスターでのみ利用可能です。

プライベートリンクはプロジェクトレベルで設定され、このプロジェクトの下で同じクラウドプロバイダーとリージョンにデプロイされたすべてのクラスターに対して有効です。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloudはプライベートリンクに対して料金を請求しません。ただし、Zilliz Cloudにアクセスするために作成した<a href="https://azure.microsoft.com/ja-jp/pricing/details/private-link/">エンドポイントごと</a>に、クラウドプロバイダーから料金が請求される場合があります。</p>

</Admonition>

## 始める前に{#before-you-start}

以下の条件が満たされていることを確認してください。

- 専用(Enterprise)クラスタが作成されました。クラスタの作成方法については、「[クラスタ作成](./create-cluster)する」を参照してください。

## プライベートエンドポイントの作成する{#create-private-endpoint}

Zilliz Cloudは、プライベートエンドポイントを追加するための直感的なWebコンソールを提供しています。ターゲットプロジェクトに移動し、左側のナビゲーションで**ネットワーク>プライベートエンドポイント**をクリックします。**+プライベートエンドポイント**をクリックします。

![setup_private_link_aws_01](/img/ja-JP/setup_private_link_aws_01.png)

### クラウドプロバイダーと地域を選択する{#select-a-cloud-provider-and-region}

Azureリージョンにデプロイされたクラスターのプライベートエンドポイントを作成するには、[**Azure**]を[**クラウドプロバイダー**]ドロップダウンリストから選択します。[**リージョン**]で、プライベートにアクセスするクラスターを収容するリージョンを選択します。[**次**へ]をクリックします。

利用可能なクラウドプロバイダーとリージョンの詳細については、「[クラウドプロバイダー&地域](./cloud-providers-and-regions)」を参照してください。

![setup_private_link_window_azure](/img/ja-JP/setup_private_link_window_azure.png)

### エンドポイントサービスを確立する{#establish-and-endpoint-service}

![establish_endpoint_service_azure](/img/ja-JP/establish_endpoint_service_azure.png)

以下は[Microsoft Azureサブスクリプションページ](https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBladeV1)からコピーしたサブスクリプションIDの例です。

### エンドポイントを作成する{#create-an-endpoint}

クラウドプロバイダーコンソールでこの手順を完了する必要があります。

1. [[プライベートリンクセンター](https://portal.azure.com/#view/Microsoft_Azure_Network/PrivateLinkCenterBlade/~/privateendpoints)]に移動し、[**+作成**]をクリックします。

    ![NMJVb8eq1o8cysxlcM4c3N6rneh](/img/ja-JP/NMJVb8eq1o8cysxlcM4c3N6rneh.png)

1. 作成するプライベートエンドポイントの基本情報を入力してください。

    ![RSAebLea3oj1OyxXT6jc1IrJnph](/img/ja-JP/RSAebLea3oj1OyxXT6jc1IrJnph.png)

1. [**Next: Resource>**]をクリックし、[**Connect to an Azure resource by resource ID or alias**]を選択します。次に、Zilliz Cloudコンソールからコピーしたリソースを**リソースIDまたはエイリアス**に貼り付けます。

    ![P5jUbCghNoJ26bxKnoycO1Lnn6r](/img/ja-JP/P5jUbCghNoJ26bxKnoycO1Lnn6r.png)

1. [**仮想ネットワーク**]と[**サブネット**]で適切な値を選択し、このタブのその他の設定はデフォルトのままにします。

    ![CthVb5C4Eouf0mxVARnc7RPEnZf](/img/ja-JP/CthVb5C4Eouf0mxVARnc7RPEnZf.png)

1. [**次**へ]をクリックして、[**レビュー+作成**]タブに移動します。検証に合格した場合は、[**作成**]をクリックしてプライベートエンドポイントを作成します。

    ![LxXxbI88joBShBxnK1McboINnTf](/img/ja-JP/LxXxbI88joBShBxnK1McboINnTf.png)

1. 展開が成功すると、以下が表示されます。

    ![H5TUbOss2oRNoMxIEp8cj9tdnmb](/img/ja-JP/H5TUbOss2oRNoMxIEp8cj9tdnmb.png)

1. [**リソースに移動**]をクリックして、作成したプライベートエンドポイントの概要ページを表示します。

1. Overviewページの右上にある**JSON View**をクリックしてくださ**い**。**Connection Status**は**Pending**と表示されます。

    ![Yf3CbAO3MoklJAxopqUck54dnvc](/img/ja-JP/Yf3CbAO3MoklJAxopqUck54dnvc.png)

    「**リソースJSON**」パネルで、`name`とproperties. resourceGuidの値をコピーし`ま`す。エンドポイントIDは、これら2つの値にピリオド(.)を付けたものである必要があり`ま`す。

    ![MKJQbI9THo4gQ3xQKuocGhBOnjg](/img/ja-JP/MKJQbI9THo4gQ3xQKuocGhBOnjg.png)

    例えば、キー`名`の値は`zilliz`で、キーproperties. resourceGuidの値は`d73e9b55-7b9c-4f8d-8f0a-40e737f1ccbf`です。プライベートエンドポイントIDは`d73e9b55-7b9c-4f8d-8f0a-40e737f1ccbf`である必要がありま`す。`

### エンドポイントを承認する{#authorize-your-endpoint}

Azureコンソールから取得したエンドポイントIDをZilliz Cloudの[**エンドポイントID**]ボックスに貼り付けます。[**作成**]をクリックします。

## プライベートリンクを取得する{#obtain-a-private-link}

送信した属性を確認して承認した後、Zilliz Cloudはこのエンドポイントにプライベートリンクを割り当てます。この過程には約5分かかります。

プライベートリンクが準備できたら、Zilliz Cloudの**プライベートリンク**ページで閲覧可能です。

## DNSの設定{#set-up-dns}

Zilliz Cloudが割り当てたプライベートリンクを使用してクラスタをアクセス可能にする前に、DNSを設定する必要があります。

### AzureポータルでプライベートDNSゾーンを作成する{#create-a-private-dns-zone-on-the-azure-portal}

1. 作成したプライベートエンドポイントの[**概要**]ページで、[**設定**]>[**DNS構成**]を選択し、プライベートエンドポイントとともに作成したネットワークインターフェイスの**IPアドレス**をコピーします。

    ![Ro6obryyhoNnVCxExrLcu97DnFb](/img/ja-JP/Ro6obryyhoNnVCxExrLcu97DnFb.png)

    上のスクリーンショットの値の例は**10.0.0.4。**

1. [[プライベートDNSゾーンの作成](https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.Network%2FprivateDnsZones)]に移動し、[**+作成**]をクリックしてプロセスを開始します。

1. [**基本**]タブで、上記で使用したサブスクリプションとリソースグループを選択し、Zilliz CloudコンソールからコピーしたプライベートリンクURIを[**インスタンス詳細**]>[**名前**]に貼り付けます。次に、[**作成を確認**]をクリックします。

    ![XD2TbAf62osTeRxQ2ZPcn1rQnkh](/img/ja-JP/XD2TbAf62osTeRxQ2ZPcn1rQnkh.png)

1. 検証が完了したら、作成をクリックして過程を開始します。

    ![LoMUbPFMkoO4EdxEAiScfOJ7nVf](/img/ja-JP/LoMUbPFMkoO4EdxEAiScfOJ7nVf.png)

1. デプロイが成功した場合、以下が表示されます。

    ![Vro4b1Yfbonb5QxGhvRccgginSd](/img/ja-JP/Vro4b1Yfbonb5QxGhvRccgginSd.png)

1. [**リソースに移動**]をクリックして、作成したプライベートDNSゾーンの**概要**ページを表示します。

    ![EhaqbNu1homiZRxUC8BcDSf3nHd](/img/ja-JP/EhaqbNu1homiZRxUC8BcDSf3nHd.png)

### プライベートDNSゾーンを仮想ネットワークにリンクする{#link-the-private-dns-zone-to-your-virtual-network}

1. 作成したプライベートDNSゾーンの[概要]ページで、左側のナビゲーションウィンドウの[**設定**]>[**仮想ネットワークリンク**]を選択します。

1. [**+追加**]をクリックします。[**仮想ネットワークリンク**の追加]ダイアログボックスで、**リンク名**を入力し、上記で使用した[**サブスクリプション**と**仮想ネットワーク**]を選択します。[**構成**]セクションで、[**自動登録**も有効にする]を選択します。

    ![NWyGbpkMXogi8kx5MLDciI1GnYf](/img/ja-JP/NWyGbpkMXogi8kx5MLDciI1GnYf.png)

    すべてが期待どおりに設定されたら、[**OK**]をクリックして続行します。デプロイが成功すると、作成された仮想ネットワークリンクのリンクステータスが[**完了**]に変わります。

    ![ZIbEbBZQho5R9jxelfncfpkjnEc](/img/ja-JP/ZIbEbBZQho5R9jxelfncfpkjnEc.png)

1. 左ナビゲーションウィンドウの**概要**をクリックして、プライベートDNSゾーンの**概要**ページに戻ります。

    ![AIzobdHXwoN0evxn1yRc9ooKnBf](/img/ja-JP/AIzobdHXwoN0evxn1yRc9ooKnBf.png)

1. [**+レコードセット**]をクリックします。[**レコードセット追加**]ダイアログボックスで、`名前`に-privatelinkを付けたクラスターIDを入力し、**タイプ**で**A-アドレスレコード**を**選択**し、**TTL**を**10分**に設定します。リストされたIPアドレスがメモしたものであるかどうかを確認してください。

    ![YJpzbctcJoiAz3xEAsTc7Rp2n6g](/img/ja-JP/YJpzbctcJoiAz3xEAsTc7Rp2n6g.png)

    [**OK**]をクリックしてレコードセットを保存します。

    ![IL9UbOvjaosxTqxp9XlcQGbdnmf](/img/ja-JP/IL9UbOvjaosxTqxp9XlcQGbdnmf.png)

1. Azure Portalで作成したプライベートエンドポイントの[概要]ページに戻ると、プライベートエンドポイントの**接続状態**が[**保留中**]から[**承認済み**]に変わります。

    ![Shh8b9DoWorTdOxksckcey6Cnch](/img/ja-JP/Shh8b9DoWorTdOxksckcey6Cnch.png)

    Azure仮想ネットワーク内のリソースは、Zilliz Cloudクラスターにプライベートでアクセス可能になりました。

## クラスタへのインターネットアクセスを管理する{#manage-internet-access-to-your-clusters}

プライベートエンドポイントを設定した後、クラスターのパブリックエンドポイントを無効にして、プロジェクトへのインターネットアクセスを制限することができます。パブリックエンドポイントを無効にすると、ユーザーはプライベートリンクを使用してクラスターにのみ接続できます。

パブリックエンドポイントを無効にするには:

1. ターゲットクラスタの**クラスタ詳細**ページに移動します。

1. [**接続**]セクションに移動します。

1. クラスターパブリックエンドポイントの横にある構成アイコンをクリックしてください。

1. 情報を読んで、**無効**にするをクリックして、**パブリックエンドポイントを無効**にするダイアログボックス。

<Admonition type="info" icon="Notes" title="undefined">

<ul>
<li><p>プライベートエンドポイントは<a href="/ja-JP/reference/restful/data-plane-v2">データプレーン</a>へのアクセスにのみ影響します。<a href="/ja-JP/reference/restful/control-plane-v2">コントロールプレーン</a>は引き続きパブリックインターネットからアクセスできます。</p></li>
<li><p>パブリックエンドポイントを再度有効にした後、ローカルDNSキャッシュの有効期限が切れるまで、パブリックエンドポイントにアクセス可能にする必要がある場合があります。</p></li>
</ul>

</Admonition>

![disable_public_endpoint](/img/ja-JP/disable_public_endpoint.png)

