---
title: "APIキー | Cloud"
slug: /manage-api-keys
sidebar_label: "APIキー"
beta: FALSE
notebook: FALSE
description: "APIキーは、Zilliz CloudのコントロールプレーンおよびデータプレーンリソースにアクセスするためにAPIまたはSDK呼び出しを行うユーザーまたはアプリケーションを認証するために使用されます。APIキーは、名前やIDなどの独自のプロパティを持つ英数字の文字列です。 | Cloud"
type: origin
token: BRsZwqOUTiBbrPk9b5WcvFgTnze
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster credentials
  - api key
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation

---

import Admonition from '@theme/Admonition';


# APIキー

APIキーは、Zilliz CloudのコントロールプレーンおよびデータプレーンリソースにアクセスするためにAPIまたはSDK呼び出しを行うユーザーまたはアプリケーションを認証するために使用されます。APIキーは、名前やIDなどの独自のプロパティを持つ英数字の文字列です。

## APIキーの概要{#overview-of-api-keys}

Zilliz Cloudは、多様なユーザー要件に対応するために2種類のAPIキーを提供しています

- **パーソナルAPIキー**:ユーザー登録時に自動的に生成され、各キーはユーザーのアカウントにリンクされ、ユーザーが所属する組織およびプロジェクト内のユーザーの役割の特権を継承します。アカウントのユーザーが組織を離れる場合、関連するパーソナルキーは自動的に削除されます。[組織オーナー](./organization-users#organization-roles)または[プロジェクト管理者](./project-users#project-roles)として、Zilliz Cloud Webコンソールで2種類のパーソナルAPIキーを表示できます

    - **あなた自身の個人APIキー**:あなただけの個人キーです。このAPIキーを閲覧してコピーすることができます。

    - **メンバーの個人APIキー**:組織またはプロジェクト内の他のユーザーが所有する既存の個人キーのリストです。これらのキーの名前とIDのみを表示できますが、キー自体は表示できません。

- カスタマイズされたAPIキー: Zilliz Cloudアカウントを持たないアプリケーションまたは外部ユーザーのために、組織オーナーとプロジェクト管理者によって手動で作成されます。これらのキーは長期的なアクセスニーズに最適であり、APIキーの最初の作成者が組織を離れてもサービスの継続性を確保します。

次の図は、APIキーの役割とリソースへのアクセスを示しています。

![Ec7wwrAnFhGIZFbJTWwc57bVn0f](/img/Ec7wwrAnFhGIZFbJTWwc57bVn0f.png)

以下の表は、割り当てられたロールに基づくAPIキーのアクセス範囲の詳細を示しています。ロールと権限の詳細については、[アクセス制御](./access-control)を参照してください。

<table>
   <tr>
     <th colspan="2"><p><strong>APIキーの役割</strong></p></th>
     <th><p><strong>アクセスレベル</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>組織オーナー</p></td>
     <td><p>プロジェクトやクラスターを含む組織内のすべてのリソースへの完全な管理者アクセス。</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>組織の請求管理</p></td>
     <td><p>組織の課金には管理者のみがアクセスできます。組織内のプロジェクトやクラスターにはアクセスできません。</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>組織メンバー</p></td>
     <td><p>プロジェクト管理者</p></td>
     <td><p>デフォルトでは、指定されたプロジェクトへの完全な管理者アクセスと、プロジェクト内のすべてのクラスターへの完全な管理者アクセスが可能です。</p></td>
   </tr>
   <tr>
     <td><p>プロジェクトの読み書き</p></td>
     <td><p>デフォルトでは、指定されたプロジェクトへの読み書きアクセス、およびプロジェクト内のすべてのクラスタへの読み書きアクセスが可能です。</p></td>
   </tr>
   <tr>
     <td><p>読み取り専用プロジェクト</p></td>
     <td><p>既定では、指定されたプロジェクトへの読み取り専用アクセスと、プロジェクト内のすべてのクラスターへの読み取り専用アクセスが可能です。</p></td>
   </tr>
</table>

### 制限と制約{#limits-and-restrictions}

- 各組織は最大100個のカスタマイズされたAPIキーを含めることができます。

- APIキーの管理権限は、組織やプロジェクト内のユーザーの役割によって影響を受けます。具体的な権限は以下の通りです:

    <table>
       <tr>
         <th rowspan="2"></th>
         <th rowspan="2"><p><strong>組織のオーナー</strong></p></th>
         <th rowspan="2"><p><strong>組織の請求管理</strong></p></th>
         <th colspan="3"><p><strong>組織メンバー</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>プロジェクト管理</strong></p></td>
         <td><p><strong>プロジェクトの読み書き</strong></p></td>
         <td><p><strong>読み取り専用プロジェクト</strong></p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>あなた自身のパーソナルAPIキー</strong></p></td>
       </tr>
       <tr>
         <td><p>作成する</p></td>
         <td><p>自動生成された</p></td>
         <td><p>自動生成された</p></td>
         <td><p>自動生成された</p></td>
         <td><p>自動生成された</p></td>
         <td><p>自動生成された</p></td>
       </tr>
       <tr>
         <td><p>表示とコピー</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
       </tr>
       <tr>
         <td><p>編集する</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>リセット</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
       </tr>
       <tr>
         <td><p>削除する</p></td>
         <td><p>ユーザーが組織を離れると自動的に削除されます</p></td>
         <td><p>ユーザーが組織を離れると自動的に削除されます</p></td>
         <td><p>ユーザーが組織を離れると自動的に削除されます</p></td>
         <td><p>ユーザーが組織を離れると自動的に削除されます</p></td>
         <td><p>ユーザーが組織を離れると自動的に削除されます</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>メンバーの個人APIキー</strong></p></td>
       </tr>
       <tr>
         <td><p>作成する</p></td>
         <td><p>自動生成された</p></td>
         <td><p>自動生成された</p></td>
         <td><p>自動生成された</p></td>
         <td><p>自動生成された</p></td>
         <td><p>自動生成された</p></td>
       </tr>
       <tr>
         <td><p>名前とIDを表示する</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>コピー</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>編集する</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>リセット</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>削除する</p></td>
         <td><p>メンバーが組織を離れると自動的に削除されます</p></td>
         <td><p>メンバーが組織を離れると自動的に削除されます</p></td>
         <td><p>メンバーが組織を離れると自動的に削除されます</p></td>
         <td><p>メンバーが組織を離れると自動的に削除されます</p></td>
         <td><p>メンバーが組織を離れると自動的に削除されます</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>カスタマイズされたAPIキー</strong></p></td>
       </tr>
       <tr>
         <td><p>作成する</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>表示とコピー</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>編集する</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>リセット</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>削除する</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
    </table>

## APIキーを作成する{#create-an-api-key}

Zilliz Cloudが各組織のユーザーに自動的に生成する個人キー以外にも、カスタマイズされたキーを作成することができます。カスタマイズされたAPIキーを作成できるのは、組織のオーナーとプロジェクト管理者だけです。

1. 組織の**APIキー**ページに移動します。**+APIキー**をクリックしてください。

    ![create-api-key](/img/create-api-key.png)

1. APIキー名を入力し、APIキーアクセスを設定してください。

    ![BSdPbaXHdoIPp0xBsA0chg0onfL](/img/BSdPbaXHdoIPp0xBsA0chg0onfL.png)

    - **APIキー名:**名前は64文字を超えてはいけません。

    - APIキーアクセス:適切な組織とプロジェクトの役割を割り当てることで、現在のカスタマイズされたAPIキーのアクセススコープを定義します。より細かいアクセス制御を行うには、「特定のクラスターにアクセスを制限する」をチェックして、キーがアクセス可能なクラスターを制限できます。

        <Admonition type="info" icon="📘" title="ノート">

        <p><a href="./project-users">プロジェクト管理者</a>の場合、このユーザーがAPIキーに付与できる権限は、ユーザー自身の権限範囲に限定されます。 </p>

        </Admonition>

## APIキーを表示する{#view-api-keys}

組織の**APIキー**ページに移動します。表示は、特定の[役割](./manage-api-keys#limits-and-restrictions)によって異なる場合があります。

- **Organization Owner**として、あなた自身の個人キー、すべてのメンバーの個人キー、およびすべてのカスタマイズされたキーを閲覧可能です。

- **プロジェクト管理者**として、あなたは自分自身の個人キー、メンバーの個人キー、およびあなたの権限範囲内にあるカスタマイズされたキーを閲覧可能です。例えば、*ユーザー1*が*プロジェクトA*のプロジェクト管理者であり、*キー1*が*プロジェクトA*、*B*、および*C*に管理者アクセス権を持っている場合、*キー1*は*ユーザー1*の権限を超えるアクセス範囲を持つため、*ユーザー1*に表示されません。

- **Organization Billing Admin**、**Project Read-Write**、または**Project Read-Only**として、自分の個人APIキーのみを表示できます。

以下のスクリーンショットは、APIキーの**Organization Owner**のビューを表示しています。

![KKONbcCa3o4qr9xJlhlcQMwinRd](/img/KKONbcCa3o4qr9xJlhlcQMwinRd.png)

## APIキーを編集する{#edit-an-api-key}

現在、カスタマイズされたAPIキーのみを編集できます。個人キーはアカウントユーザーに関連付けられているため、編集できません。個人キーのアクセス範囲を変更するには、まずユーザーの組織とプロジェクトの役割を調整する必要があります。ユーザーの役割に対する変更は、自動的にキーのアクセス許可に反映されます。

以下の手順では、カスタマイズされたAPIキーを編集する方法について説明します。

1. 組織の**APIキー**ページに移動します。**をクリックしてください。。。アクション欄で「編集」をクリックしてください。

    ![edit-api-key](/img/edit-api-key.png)

1. APIキー**APIキー名**と**APIキーアクセス**を編集してください。

    ![YqNtbRsyroP2cGxGLObcQgb7njh](/img/YqNtbRsyroP2cGxGLObcQgb7njh.png)

    - **APIキー名:**名前は64文字を超えてはいけません。

    - APIキーアクセス:適切な組織とプロジェクトの役割を割り当てることで、現在のカスタマイズされたAPIキーのアクセススコープを定義します。より細かいアクセス制御を行うには、「特定のクラスターにアクセスを制限する」をチェックして、キーがアクセス可能なクラスターを制限できます。

        <Admonition type="info" icon="📘" title="ノート">

        <p><a href="./project-users">プロジェクト管理者</a>の場合、このユーザーがAPIキーに付与できる権限は、ユーザー自身の権限範囲に限定されます。 </p>

        </Admonition>

## APIキーをリセットする{#reset-an-api-key}

個人用またはカスタマイズされたAPIキーが侵害されたと思われる場合は、すぐにリセットする必要があります。 

<Admonition type="caution" icon="🚧" title="警告">

<p>この操作により、現在のAPIキーがリセットおよび無効化されます。このキーを使用するアプリケーションコードは、関連するコードを新しいキー値で更新するまで機能しなくなります。</p>

</Admonition>

キーの種類によって、その過程は異なります。

- **パーソナルAPIキーのリセット**:ロールに関係なく、自分自身のパーソナルAPIキーのみをリセットできます。 

    ![reset-personal-api-keys](/img/reset-personal-api-keys.png)

- **カスタマイズされたAPIキーのリセット**:カスタマイズされたAPIキーをリセットできるのは、組織のオーナーとプロジェクト管理者だけです。

    ![reset-customized-api-keys](/img/reset-customized-api-keys.png)

## APIキーを削除する{#delete-an-api-key}

カスタマイズされたAPIキーが使用されなくなった場合は、できるだけ早く削除する必要があります。カスタマイズされたAPIキーを削除できるのは、組織のオーナーとプロジェクト管理者だけです。

個人キーは手動で削除することはできません。ただし、該当するユーザーが組織を離れると、自動的に無効化され、削除されます。 

次のスクリーンショットは、カスタマイズされたAPIキーを削除する方法を示しています。

<Admonition type="caution" icon="🚧" title="警告">

<p>APIキーを削除すると、そのキーを使用するサービスのZilliz Cloudリソースへのアクセスが不可逆的に終了します。</p>

</Admonition>

![delete-customized-api-keys](/img/delete-customized-api-keys.png)

