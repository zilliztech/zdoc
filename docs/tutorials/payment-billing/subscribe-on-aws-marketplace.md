---
title: "Subscribe on AWS Marketplace | Cloud"
slug: /subscribe-on-aws-marketplace
sidebar_label: "AWS Marketplace"
beta: FALSE
notebook: FALSE
description: "This guide provides a step-by-step walkthrough of the subscription process and outlines the pricing terms of Zilliz Cloud on AWS Marketplace. | Cloud"
type: origin
token: LDlOweEzmiLkdQkvPFec5lrcnbf
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - marketplace
  - aws

---

import Admonition from '@theme/Admonition';


# Subscribe on AWS Marketplace

This guide provides a step-by-step walkthrough of the subscription process and outlines the pricing terms of Zilliz Cloud on AWS Marketplace. 

<Admonition type="info" icon="📘" title="Notes">

<p>Once subscribed, you can pay for the usage of AWS clusters via AWS Marketplace. If you have clusters deployed on other cloud providers, you can also use AWS Marketplace to pay.</p>

</Admonition>

## Before you start{#before-you-start}

- Ensure you have an AWS Marketplace account.

- Set your AWS Buyer ID's default payment method to the Invoicing Plan. [Learn how to change your default payment method](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-payment-method.html).

- If you’re an existing Zilliz Cloud user, use a different email to subscribe on AWS Marketplace.

- If your AWS account is part of an organization, you must be authorized to make purchases by the billing administrator.

## Subscribe on AWS Marketplace{#subscribe-on-aws-marketplace}

Visit [AWS Marketplace](https://aws.amazon.com/marketplace) and start subscribing to Zilliz Cloud as follows:

1. Search for **Zilliz Cloud** in the search box, or [go to AWS Marketplace](https://aws.amazon.com/marketplace/search/results?searchTerms=zilliz+cloud) to view the Zilliz Cloud portal page.

    ![search_for_zilliz_on_aws](/img/search_for_zilliz_on_aws.png)

1. Click **Zilliz Cloud**.

    Familiarize yourself with the services and pricing. Click **View purchase options**.

    ![view_purchase_options](/img/view_purchase_options.png)

1. Scroll down the page and click **Subscribe**. 

    ![aws_flash_message](/img/aws_flash_message.png)

1. Follow the prompt to **Set up your account** on Zilliz Cloud.

    ![set-up-account](/img/set-up-account.png)

1.  In the new tab, follow the steps below to complete subscription.

    1. If you already have a Zilliz Cloud account, simply log in. If not, choose a [sign-up option](./register-with-zilliz-cloud) and follow the process. Ensure all query strings in the URL are retained to link your AWS identity to your Zilliz Cloud account.

        <Admonition type="info" icon="📘" title="Notes">

        <p>AWS Marketplace uses query strings in the URL to pass your identity information to Zilliz Cloud. Any sign-up failures may result in the loss of these query strings. As a result, Zilliz Cloud may fail to associate your AWS identity with your account registered with us. If this happens, simply return to AWS Marketplace and click <b>Set up your account</b> again.</p>

        </Admonition>

    1. Link your subscription to an existing Zilliz Cloud organization.

        ![aws-marketplace-dialog](/img/aws-marketplace-dialog.png)

    1. Complete authorization.

1. Go to **Billing** to ensure your AWS Marketplace subscription is set as your payment method.

    ![aws-marketplace-success](/img/aws-marketplace-success.png)

## Update AWS Marketplace subscription{#update-aws-marketplace-subscription}

After successfully subscribing from AWS Marketplace, you can always update your subscription at any time that you see fit. More specifically, you can either change the AWS Marketplace account used for the subscription to another one or switch your payment method from an AWS Marketplace subscription to a credit card.

### Change AWS Marketplace subscription account{#change-aws-marketplace-subscription-account}

1. Sign in to AWS Marketplace with the original AWS account you used for the subscription.

1. Cancel your Zilliz Cloud subscription. Refer to [Cancel your product subscription](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription) for more details.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Please rest assured that canceling the subscription will not delete your Zilliz Cloud data.</p>

    </Admonition>

    It takes a few minutes for AWS Marketplace to complete the cancellation process.

1. Sign out of your original AWS account.

1. Sign in to AWS Marketplace with a different AWS account that you want to use for the subscription.

1. Follow steps 1 to 4 in the [Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace#subscribe-on-aws-marketplace) section to complete your subscription to Zilliz Cloud with the new account.

    <Admonition type="info" icon="📘" title="Notes">

    <p>When updating AWS Marketplace subscription, you must click the <strong>Set up your account</strong> button to link your new subscription with Zilliz Cloud organization.</p>

    </Admonition>

1. Verify the update in the **Payment Method** section on the **Billing Overview** page. Click on the Subscription ID and verify if the subscription **Account ID** has been updated to the new Marketplace account.

### Switch to payment credit card{#switch-to-payment-credit-card}

1. Sign in to AWS Marketplace with the original AWS account you used for the subscription.

1. Cancel your Zilliz Cloud subscription. Refer to [Cancel your product subscription](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription) for more details.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Please rest assured that canceling the subscription will not delete your Zilliz Cloud data.</p>

    </Admonition>

    It takes a few minutes for AWS Marketplace to complete the cancellation process.

1. Follow the steps in [Add a payment method](./subscribe-by-adding-credit-card#add-a-credit-card) to add a payment credit card.

1. Verify the update in the **Payment Method** section on the **Billing Overview** page.

## Cancel AWS Marketplace subscription{#cancel-aws-marketplace-subscription}

To cancel your AWS Marketplace subscription, you need to open the AWS Marketplace console and follow the instructions [in the AWS guides](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html).

## AWS Marketplace pricing terms{#aws-marketplace-pricing-terms}

Please refer to [Payment & Billing](./payment-billing#marketplace-pricing-terms) for more information.

## Troubleshooting{#troubleshooting}

**What I can do if I encounter issues when linking a marketplace subscription to Zilliz Cloud?**

There are several possible reasons:

1. **Insufficient permissions** (UI prompt: Insufficient Permissions)

    To link an organization with a marketplace subscription, you must be an organization owner. But if you are an organization member, you do not have the required permissions. Please contact the organization owner for assistance.

1. **All organizations have already been successfully linked to a Marketplace subscription** (UI prompt: Marketplace Linked)

    1. If you need to update an existing marketplace subscription, please [unlink](./subscribe-on-aws-marketplace#cancel-aws-marketplace-subscription) the current subscription of the organization first and then set up a new subscription.

    1. If you need multiple organizations for different Marketplace subscription, you can:

        1. [Register](./register-with-zilliz-cloud) a new Zilliz Cloud account to create a new organization. Then, [invite](./organization-users#invite-a-user-to-join-your-organization) the organization owner to the new organization. This organization owner will then belong to multiple organizations and can setup different marketplace subscriptions for each organization.

        1. [Create a support ticket](http://support.zilliz.com) so that we will create new organizations for you. Currently, Zilliz Cloud does not support manually creating organizations by users.

1. **No organizations in the list**

    This can happen if your account has been closed or if you have left all organizations. In this case, you can:

    1. Ask other users to [invite](./organization-users#invite-a-user-to-join-your-organization) you to their organization as an organization owner.

    1. [Submit a support ticket](https://support.zilliz.com/hc/en-us) and we will create a new organization for you.

## Related topics{#related-topics}

- [Subscribe by Adding Credit Card](./subscribe-by-adding-credit-card)

- [Subscribe on Azure Marketplace](./subscribe-on-azure-marketplace)

- [Subscribe on GCP Marketplace](./subscribe-on-gcp-marketplace)

- [View Invoice](./view-invoice) 

