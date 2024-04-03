---
slug: /subscribe-on-aws-marketplace
sidebar_label: AWS Marketplace
beta: FALSE
notebook: FALSE
type: origin
token: LDlOweEzmiLkdQkvPFec5lrcnbf
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Subscribe on AWS Marketplace

This guide provides a step-by-step walkthrough of the subscription process and outlines the pricing terms of Zilliz Cloud on AWS Marketplace.

## Before you start{#before-you-start}

- Ensure you have an AWS Marketplace account.

- Set your AWS Buyer ID's default payment method to the Invoicing Plan. [Learn how to change your default payment method](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-payment-method.html).

- If you’re an existing Zilliz Cloud user, use a different email to subscribe on AWS Marketplace.

- If your AWS account is part of an organization, you must be authorized to make purchases by the billing administrator.

## Subscribe on AWS Marketplace{#subscribe-on-aws-marketplace}

Visit [AWS Marketplace](https://aws.amazon.com/marketplace) and start subscribing to Zilliz Cloud as follows:

1. Search for __Zilliz Cloud__ in the search box, or [click here](https://aws.amazon.com/marketplace/search/results?searchTerms=zilliz+cloud) to view Zilliz Cloud on AWS.

    ![search_for_zilliz_on_aws](/img/search_for_zilliz_on_aws.png)

1. Click __Zilliz Cloud__.

    Familiarize yourself with the services and pricing.

    ![view_purchase_options](/img/view_purchase_options.png)

1. Click __View purchase options__, then __Subscribe__. Follow the prompt to __Set up your account__ on Zilliz Cloud.

    ![aws_flash_message](/img/aws_flash_message.png)

1. If you already have a Zilliz Cloud account, simply log in. If not, choose a [sign-up option](./register-with-zilliz-cloud) and follow the process. Ensure all query strings in the URL are retained to link your AWS identity to your Zilliz Cloud account.

    <Admonition type="info" icon="📘" title="Notes">

    <p>AWS Marketplace uses query strings in the URL to pass your identity information to Zilliz Cloud. Any sign-up failures may result in the loss of these query strings. As a result, Zilliz Cloud may fail to associate your AWS identity with your account registered with us. If this happens, simply return to AWS Marketplace and click <b>Set up your account</b> again.</p>

    </Admonition>

1. Go to __Billing__ to ensure your AWS Marketplace subscription is set as your payment method.

    ![aws-marketplace-success](/img/aws-marketplace-success.png)

## Update AWS Marketplace subscription{#update-aws-marketplace-subscription}

After successfully subscribing from AWS Marketplace, you can always update your subscription at any time that you see fit. More specifically, you can either change the AWS Marketplace account used for the subscription to another one or switch your payment method from an AWS Marketplace subscription to a credit card.

### Change AWS Marketplace subscription account{#change-aws-marketplace-subscription-account}

1. Sign in to AWS Marketplace with the original AWS account you used for the subscription.

1. Cancel your Zilliz Cloud subscription. Refer to [Cancel your product subscription](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription) for more details.

    <Admonition type="info" icon="📘" title="Notes">

    <p>It takes a few minutes for AWS Marketplace to complete the cancellation process.</p>

    </Admonition>

1. Sign out of your original AWS account.

1. Sign in to AWS Marketplace with the new AWS account you want to use for the subscription.

1. Follow steps 1 to 4 in the [Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace#subscribe-on-aws-marketplace) section to complete your subscription to Zilliz Cloud with the new account.

### Switch to payment credit card{#switch-to-payment-credit-card}

1. Sign in to AWS Marketplace with the original AWS account you used for the subscription.

1. Cancel your Zilliz Cloud subscription. Refer to [Cancel your product subscription](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription) for more details.

    <Admonition type="info" icon="📘" title="Notes">

    <p>It takes a few minutes for AWS Marketplace to complete the cancellation process.</p>

    </Admonition>

1. Follow the steps in [Add a payment method](./subscribe-by-adding-credit-card#add-a-credit-card) to add a payment credit card.

1. Check out your current payment method in your billing overview.

## Cancel AWS Marketplace subscription{#cancel-aws-marketplace-subscription}

To cancel your AWS Marketplace subscription, you need to open the AWS Marketplace console and follow the instructions [here](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html).

## AWS Marketplace pricing terms{#aws-marketplace-pricing-terms}

Please refer to [Payment & Billing](./payment-billing#marketplace-pricing-terms) for more information.

## Related topics{#related-topics}

- [Subscribe by Adding Credit Card](./subscribe-by-adding-credit-card)

- [Subscribe on Azure Marketplace](./subscribe-on-azure-marketplace)

- [Subscribe on GCP Marketplace](./subscribe-on-gcp-marketplace)

- [View Invoice](./view-invoice) 

