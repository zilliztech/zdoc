---
title: "FAQ: ユーザーとロール | BYOC"
slug: /faq-users-and-roles
sidebar_label: "FAQ: ユーザーとロール"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud で発生する可能性のあるユーザー、ロール、アクセスに関する問題と、その対応する解決策を示します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 8
displayed_sidebar: default

---

# FAQ: ユーザーとロール

このトピックでは、Zilliz Cloud で発生する可能性のあるユーザー、ロール、アクセスに関する問題と、その対応する解決策を示します。

## 目次

- [組織から脱退できますか？](#can-i-leave-my-organization)
- [組織名を編集するにはどうすればよいですか？](#how-can-i-edit-my-organization-name)
- [同僚やチームメイトをコラボレーションに招待するにはどうすればよいですか？](#how-can-i-invite-a-colleague-or-teammate-to-collaborate)
- [特定の権限またはカスタム権限グループを持つロールを作成できますか？](#can-i-create-a-role-with-specific-privileges-or-custom-privilege-groups)

## FAQ




### 組織から脱退できますか？\{#can-i-leave-my-organization}

あなたが組織メンバーである場合、自由に組織から脱退できます。 

あなたが組織オーナーである場合、組織内の最後のオーナーでないときにのみ組織から脱退できます。組織には少なくとも 1 人のオーナーが必要であり、組織内で唯一のオーナーは脱退できません。

### 組織名を編集するにはどうすればよいですか？\{#how-can-i-edit-my-organization-name}

1. 組織を選択します。

1. 左側のナビゲーションで **Settings** をクリックします。

1. **Organization** **Settings** ページの **Organization Information** セクションで、**Edit** をクリックします。

1. 新しい組織名を入力し、**Confirm** をクリックします。

1. 組織名が正常に変更されたことを示すメッセージが表示されます。

### 同僚やチームメイトをコラボレーションに招待するにはどうすればよいですか？\{#how-can-i-invite-a-colleague-or-teammate-to-collaborate}

あなたが組織オーナーである場合、ユーザーを組織に招待できます。詳細な手順については、[組織ユーザーの管理](./organization-users) を参照してください。

あなたが組織メンバーである場合、他のユーザーを招待するよう組織オーナーに連絡できます。

さらに、Zilliz Cloud ではプロジェクトへのユーザー招待もサポートしています。あなたがプロジェクト管理者である場合、他のプロジェクトユーザーを自分のプロジェクトに招待できます。詳細な手順については、[プロジェクトユーザーの管理](./project-users) を参照してください。

### 特定の権限またはカスタム権限グループを持つロールを作成できますか？\{#can-i-create-a-role-with-specific-privileges-or-custom-privilege-groups}

はい。まず、この機能を有効化できるように、[サポートチケットを作成](http://support.zilliz.com) する必要があります。この機能が有効になると、SDKs を使用してこのタスクを完了できます。詳細については、[権限と権限グループ](./cluster-privileges#custom-privilege-groups) を参照してください。
