---
title: "APIキー | Cloud"
slug: /manage-api-keys
sidebar_key: manage-api-keys
sidebar_label: "APIキー"
beta: FALSE
notebook: FALSE
description: "APIキーは、Zilliz Cloud のコントロールプレーンおよびデータプレーンのリソースにアクセスするための API または SDK 呼び出しを行うユーザーまたはアプリケーションを認証するために使用されます。APIキーは、名前や ID などの独自のプロパティを持つ英数字の文字列です。 | Cloud"
type: origin
token: BRsZwqOUTiBbrPk9b5WcvFgTnze
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - クラスター認証情報
  - api key

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# APIキー

APIキーは、Zilliz CloudのコントロールプレーンおよびデータプレーンのリソースにアクセスするためのAPIまたはSDK呼び出しを行うユーザーまたはアプリケーションを認証するために使用されます。APIキーは、名前やIDなどの独自のプロパティを持つ英数字の文字列です。

## APIキーの概要\{#overview-of-api-keys}

Zilliz Cloudは、多様なユーザーの要件を満たすために、2種類のAPIキーを提供しています。

- **個人APIキー**: ユーザー登録時に自動生成され、各キーはユーザーのアカウントにリンクされ、ユーザーが所属する組織およびプロジェクト内でのユーザーのロールの権限を継承します。アカウントユーザーが組織を離れると、関連する個人キーは自動的に削除されます。[組織オーナー](./organization-users#organization-owner)または[プロジェクト管理者](./project-users#project-admin)として、Zilliz Cloud Webコンソールで2種類の個人APIキーを確認できます。

    - **自分自身の個人APIキー**: 自分だけに属する個人キー。このAPIキーを表示およびコピーできます。

    - **メンバーの個人APIキー**: 組織またはプロジェクト内の他のユーザーに属する既存の個人キーのリスト。これらのキーの名前とIDのみを表示でき、キー自体は表示できません。

- **カスタマイズされたAPIキー**: Zilliz Cloudアカウントを持たないアプリケーションまたは外部ユーザー向けに、**組織オーナー**および**プロジェクト管理者**によって手動で作成されます。これらのキーは長期的なアクセスニーズに最適で、APIキーの初期作成者が組織を離れてもサービスの継続性を確保します。

<Admonition type="info" icon="📘" title="Notes">

本番環境では、代わりにカスタマイズされたキーを使用してください。個人APIキーは、ユーザーアカウントとともに削除されます。

</Admonition>

次の図は、APIキーのロールとリソースアクセスを示しています。

![Ec7wwrAnFhGIZFbJTWwc57bVn0f](https://zdoc-images.s3.us-west-2.amazonaws.com/Ec7wwrAnFhGIZFbJTWwc57bVn0f.png)

以下の表は、割り当てられたロールに基づくAPIキーのアクセス範囲の詳細を示しています。ロールと権限の詳細については、[アクセス制御の説明](./access-control-overview)を参照してください。

<table>
   <tr>
     <th colspan="2"><p><strong>APIキーロール</strong></p></th>
     <th><p><strong>アクセスレベル</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>組織オーナー</p></td>
     <td><p>プロジェクト、クラスター、ボリュームを含む組織内のすべてのリソースへの完全な管理者アクセス。</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>組織の請求管理者</p></td>
     <td><p>組織の請求のみへの管理者アクセス。組織内のプロジェクト、クラスター、およびボリュームへのアクセスはありません。</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>組織メンバー</p></td>
     <td><p>プロジェクト管理者</p></td>
     <td><p>指定されたプロジェクトへの完全な管理者アクセス、およびデフォルトでプロジェクト内のすべてのクラスターとボリュームへの完全な管理者アクセス。</p></td>
   </tr>
   <tr>
     <td><p>プロジェクト読み書き</p></td>
     <td><p>指定されたプロジェクトへの読み書きアクセス、およびデフォルトでプロジェクト内のすべてのクラスターとボリュームへの読み書きアクセス。</p></td>
   </tr>
   <tr>
     <td><p>プロジェクト読み取り専用</p></td>
     <td><p>指定されたプロジェクトへの読み取り専用アクセス、およびデフォルトでプロジェクト内のすべてのクラスターとボリュームへの読み取り専用アクセス。</p></td>
   </tr>
</table>

### 制限と制約\{#limits-and-restrictions}

- 各組織には、最大100個のカスタマイズされたAPIキーを含めることができます。

- APIキーの管理権限は、組織およびプロジェクト内でのユーザーのロールによって影響を受けます。具体的な権限は以下の通りです。

    <table>
       <tr>
         <th rowspan="2"></th>
         <th rowspan="2"><p><strong>組織オーナー</strong></p></th>
         <th rowspan="2"><p><strong>組織の請求管理者</strong></p></th>
         <th colspan="3"><p><strong>組織メンバー</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>プロジェクト管理者</strong></p></td>
         <td><p><strong>プロジェクト読み書き</strong></p></td>
         <td><p><strong>プロジェクト読み取り専用</strong></p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>自分自身の個人APIキー</strong></p></td>
       </tr>
       <tr>
         <td><p>作成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
       </tr>
       <tr>
         <td><p>表示とコピー</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️ </p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
       </tr>
       <tr>
         <td><p>編集</p></td>
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
         <td><p>削除</p></td>
         <td><p>ユーザーが組織を離れると自動削除</p></td>
         <td><p>ユーザーが組織を離れると自動削除</p></td>
         <td><p>ユーザーが組織を離れると自動削除</p></td>
         <td><p>ユーザーが組織を離れると自動削除</p></td>
         <td><p>ユーザーが組織を離れると自動削除</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>メンバーの個人APIキー</strong></p></td>
       </tr>
       <tr>
         <td><p>作成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
       </tr>
       <tr>
         <td><p>名前とIDの表示</p></td>
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
         <td><p>編集</p></td>
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
         <td><p>削除</p></td>
         <td><p>メンバーが組織を離れると自動削除</p></td>
         <td><p>メンバーが組織を離れると自動削除</p></td>
         <td><p>メンバーが組織を離れると自動削除</p></td>
         <td><p>メンバーが組織を離れると自動削除</p></td>
         <td><p>メンバーが組織を離れると自動削除</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>カスタマイズされたAPIキー</strong></p></td>
       </tr>
       <tr>
         <td><p>作成</p></td>
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
         <td><p>編集</p></td>
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
         <td><p>削除</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
    </table>

## APIキーの作成\{#create-an-api-key}

Zilliz Cloudが各組織ユーザーに対して自動生成する個人キーとは別に、カスタマイズされたキーを作成できます。カスタマイズされたAPIキーを作成できるのは、**組織オーナー**および**プロジェクト管理者**のみです。

<Procedures>

1. 組織の **APIキー** ページに移動します。**+ APIキー** をクリックします。

    ![create-api-key](https://zdoc-images.s3.us-west-2.amazonaws.com/create-api-key.png "create-api-key")

1. **APIキー名** を入力し、**APIキーアクセス** を設定します。

    ![Td6mboU99oiRhVxvbYecZJf1nGC](https://zdoc-images.s3.us-west-2.amazonaws.com/td6mbou99oirhvxvbyeczjf1ngc.png "Td6mboU99oiRhVxvbYecZJf1nGC")

    - **APIキー名:** 名前は64文字を超えてはいけません。

    - **APIキーの説明（オプション）**: 作成するAPIキーの説明です。最大 255 文字です。

    - **APIキーアクセス**: 適切な組織およびプロジェクトのロールを割り当てることで、現在のカスタマイズされたAPIキーのアクセス範囲を定義します。よりきめ細かいアクセス制御を行うには、**特定のクラスターとボリュームへのアクセスを制限する** をチェックして、キーがアクセスできるクラスターとボリュームを制限できます。

        <Admonition type="info" icon="📘" title="Notes">

        [プロジェクト管理者](./project-users)の場合、このユーザーがAPIキーに付与できる権限は、ユーザー自身の権限範囲に制限されます。

        </Admonition>

</Procedures>

## APIキーの表示\{#view-api-keys}

組織の **APIキー** ページに移動します。表示内容は、特定の[ロール](./manage-api-keys#limits-and-restrictions)によって異なる場合があります。

- **組織オーナー**として、自分自身の個人キー、すべてのメンバーの個人キー、およびすべてのカスタマイズされたキーを表示できます。

- **プロジェクト管理者**として、自分自身の個人キー、メンバーの個人キー、および自分の権限範囲内のカスタマイズされたキーを表示できます。例えば、*ユーザー1*が*プロジェクトA*のプロジェクト管理者のみで、*キー1*が*プロジェクトA*、*B*、*C*への管理者アクセスを持っている場合、*キー1*のアクセス範囲が*ユーザー1*の権限を超えているため、*ユーザー1*には*キー1*は表示されません。

- **組織の請求管理者**、**プロジェクト読み書き**、または**プロジェクト読み取り専用**として、自分自身の個人APIキーのみを表示できます。

以下のスクリーンショットは、**組織オーナー**のAPIキー表示画面です。

![KKONbcCa3o4qr9xJlhlcQMwinRd](https://zdoc-images.s3.us-west-2.amazonaws.com/kkonbcca3o4qr9xjlhlcqmwinrd.png "KKONbcCa3o4qr9xJlhlcQMwinRd")

## APIキーの編集\{#edit-an-api-key}

現在、カスタマイズされたAPIキーのみを編集できます。個人キーはアカウントユーザーに紐付いているため編集できません。個人キーのアクセス範囲を変更するには、まずユーザーの組織およびプロジェクトのロールを調整する必要があります。ユーザーのロールに変更を加えると、キーのアクセス権限に自動的に反映されます。

以下の手順では、カスタマイズされたAPIキーの編集方法を説明します。

<Procedures>

1. 組織の **APIキー** ページに移動します。アクション列の **...** をクリックし、**編集** をクリックします。

    ![edit-api-key](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-api-key.png "edit-api-key")

1. APIキーの **APIキー名** と **APIキーアクセス** を編集します。

    ![JXeubHidbokaTax90eZcrmA9nIg](https://zdoc-images.s3.us-west-2.amazonaws.com/jxeubhidbokatax90ezcrma9nig.png "JXeubHidbokaTax90eZcrmA9nIg")

    - **APIキー名:** 名前は64文字を超えてはいけません。

    - **APIキーアクセス**: 適切な組織およびプロジェクトのロールを割り当てることで、現在のカスタマイズされたAPIキーのアクセス範囲を定義します。よりきめ細かいアクセス制御を行うには、**特定のクラスターとボリュームへのアクセスを制限する** をチェックして、キーがアクセスできるクラスターとボリュームを制限できます。

        <Admonition type="info" icon="📘" title="Notes">

        [プロジェクト管理者](./project-users)の場合、このユーザーがAPIキーに付与できる権限は、ユーザー自身の権限範囲に制限されます。

        </Admonition>

</Procedures>

## APIキーのリセット\{#reset-an-api-key}

個人またはカスタマイズされたAPIキーが侵害されたと思われる場合は、直ちにリセットする必要があります。

<Admonition type="caution" icon="🚧" title="Warning">

この操作により、現在のAPIキーがリセットされ無効になります。このキーを使用しているアプリケーションコードは、関連するコードを新しいキー値で更新するまで機能しなくなります。

</Admonition>

キーの種類によって、プロセスは異なります。

- **個人APIキーのリセット**: 自分自身の個人APIキーのみをリセットできます。ロールに関係なく可能です。

    ![reset-personal-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/reset-personal-api-keys.png "reset-personal-api-keys")

- **カスタマイズされたAPIキーのリセット**: 組織オーナーおよびプロジェクト管理者のみがカスタマイズされたAPIキーをリセットできます。

    ![reset-customized-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/reset-customized-api-keys.png "reset-customized-api-keys")

## APIキーの削除\{#delete-an-api-key}

カスタマイズされたAPIキーが使用されなくなった場合は、できるだけ早く削除する必要があります。カスタマイズされたAPIキーを削除できるのは、**組織オーナー**および**プロジェクト管理者**のみです。

個人キーは手動で削除できません。ただし、対応するユーザーが組織を離れると、自動的に無効化され削除されます。

以下のスクリーンショットは、カスタマイズされたAPIキーの削除方法を示しています。

<Admonition type="caution" icon="🚧" title="Warning">

APIキーを削除すると、そのキーを使用しているすべてのサービスに対するZilliz Cloudリソースへのアクセスが不可逆的に終了します。

</Admonition>

![delete-customized-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-customized-api-keys.png "delete-customized-api-keys")

## FAQ\{#faq}

**本番環境で個人APIキーを使用すべきですか？**

いいえ。**個人APIキー**は個々のユーザーアカウントに紐付いており、ユーザーが組織を離れると自動的に削除されます。キーオーナーのアカウントが削除されると、そのキーに依存しているアプリケーションやサービスは、直ちにZilliz Cloudリソースへのアクセスを失います。

本番環境では、代わりに**カスタマイズされたAPIキー**を使用してください。カスタマイズされたキーは個々のユーザーアカウントから独立しており、チームメンバーが組織を離れてもサービスの継続性を確保します。    
