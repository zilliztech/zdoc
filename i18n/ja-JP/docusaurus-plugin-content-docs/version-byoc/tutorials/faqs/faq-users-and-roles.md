---
title: "FAQ: ユーザーとロール | BYOC"
slug: /faq-users-and-roles
sidebar_label: "FAQ: ユーザーとロール"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudでユーザー、ロール、アクセスに関する問題に遭遇する可能性のある問題とその解決方法についてこのトピックで紹介します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 8

---

# FAQ: ユーザーとロール

このトピックでは、Zilliz Cloudでユーザー、ロール、アクセスに関する問題に遭遇する可能性のある問題とその解決方法について紹介します。

## 目次

- [組織から脱退できますか？](#can-i-leave-my-organization)
- [組織名をどのように編集できますか？](#how-can-i-edit-my-organization-name)
- [同僚やチームメイトを協力者として招待するにはどうすればよいですか？](#how-can-i-invite-a-colleague-or-teammate-to-collaborate)
- [特定の権限またはカスタム権限グループを持つロールを作成できますか？](#can-i-create-a-role-with-specific-privileges-or-custom-privilege-groups)

## よくある質問




### 組織から脱退できますか？\{#can-i-leave-my-organization}

組織のメンバーである場合は、自由に組織から脱退できます。

組織の所有者である場合は、組織内の最後の所有者でない場合にのみ組織から脱退できます。組織には少なくとも1人の所有者がいなければならず、組織内に唯一の所有者がいる場合、その所有者は組織から脱退できません。

### 組織名をどのように編集できますか？\{#how-can-i-edit-my-organization-name}

1. 組織を選択します。

2. 左側のナビゲーションで**設定**をクリックします。

3. **組織** **設定**ページの**組織情報**セクションで、**編集**をクリックします。

4. 新しい組織名を入力して**確認**をクリックします。

5. 組織名が正常に変更されたことを示すメッセージが表示されます。

### 同僚やチームメイトを協力者として招待するにはどうすればよいですか？\{#how-can-i-invite-a-colleague-or-teammate-to-collaborate}

組織の所有者である場合は、ユーザーを組織に招待できます。詳細な手順については、[組織ユーザーの管理](./organization-users)を参照してください。

組織のメンバーである場合は、他のユーザーを招待するように組織の所有者に連絡できます。

さらに、Zilliz Cloudではプロジェクトにユーザーを招待することもサポートしています。プロジェクト管理者である場合は、他のプロジェクトユーザーをプロジェクトに招待できます。詳細な手順については、[プロジェクトユーザーの管理](./project-users)を参照してください。

### 特定の権限またはカスタム権限グループを持つロールを作成できますか？\{#can-i-create-a-role-with-specific-privileges-or-custom-privilege-groups}

はい。まず[サポートチケットを作成](http://support.zilliz.com)して、この機能を有効にしてもらう必要があります。この機能が有効になると、SDKを使用してこのタスクを完了できます。詳細については、[権限と権限グループ](./cluster-privileges#custom-privilege-groups)を参照してください。
