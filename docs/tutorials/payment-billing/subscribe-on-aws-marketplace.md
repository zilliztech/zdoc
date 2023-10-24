---
slug: /subscribe-on-aws-marketplace
beta: FALSE
notebook: FALSE
sidebar_position: 3
---



# Subscribe on AWS Marketplace

Zilliz Cloud is now available on AWS Marketplace. Instead of providing credit card information for payment, you can subscribe to our service on AWS Marketplace.

This guide will walk you through the process of subscribing to our service on AWS Marketplace and explain the pricing terms of Zilliz Cloud on AWS Marketplace.

## Before you start{#before-you-start}

- Make sure that you have already registered an account with AWS Marketplace.

- Ensure that your default payment method for the AWS Buyer ID is set to **Invoicing Plan**. For more information, see [How do I change the default payment method associated with my AWS account?](https://repost.aws/knowledge-center/change-default-payment-method)

- If you have already registered with Zilliz Cloud, use a different email address to subscribe to our service on AWS Marketplace.

- If you have a member account of an organization on AWS, you must be enabled for purchase by the billing administrator of your organization.

## Subscribe on AWS Marketplace{#subscribe-on-aws-marketplace}

Once you have a registered AWS account, visit [AWS Marketplace](https://aws.amazon.com/marketplace) and start subscribing to Zilliz Cloud as follows:

1. Search for **Zilliz Cloud** in the search box, or [click here](https://aws.amazon.com/marketplace/search/results?searchTerms=zilliz+cloud) to view Zilliz Cloud on AWS.
    ![search_for_zilliz_on_aws](/img/search_for_zilliz_on_aws.png)

1. Click **Zilliz Cloud**.
    You can learn about the service we offer and how you will be charged regarding the usage.

    ![view_purchase_options](/img/view_purchase_options.png)

1. Click **View purchase options**. On the **Subscribe to Zilliz Cloud** page opened, click **Subscribe**.
    A flash message appears at the top of the page, asking you to click **Set up your account** to continue your registration on Zilliz Cloud.

    ![aws_flash_message](/img/aws_flash_message.png)

1. Click **Set up your account**.
    The Zilliz Cloud login page appears in a new tab. If you already have a Zilliz Cloud account, please directly log in. If you have not registered on Zilliz Cloud, choose a method that suits you to sign up first. Available options are:

    :::info Notes    
    
    
    AWS Marketplace uses query strings in the URL to pass your identity information to Zilliz Cloud. Any sign-up failures may result in the loss of these query strings. As a result, Zilliz Cloud may fail to associate your AWS identity with your account registered with us. If this happens, simply return to AWS Marketplace and click **Set up your account** again.

    :::

1. Fill in the investigation form.
    To sign up for the $100 worth of long-term credits, please provide the following information:

    - Your name

    - The name of your company

    - Your country of origin

    Additionally, it would be helpful if you could provide information on the scale of your data and the reason for your interest in the trial. If you would like to receive notifications about upcoming features, please select the option to receive emails from Zilliz Cloud about products, services, and events.

    ![fill_the_form](/img/fill_the_form.png)

1. Once the registration completes, click **Billing** in the left navigation pane and check your payment method.
    ![aws-marketplace-success](/img/aws-marketplace-success.png)

## Update AWS Marketplace subscription{#update-aws-marketplace-subscription}

After successfully subscribing from AWS Marketplace, you can always update your subscription at any time that you see fit. More specifically, you can either change the AWS Marketplace account used for the subscription to another one or switch your payment method from an AWS Marketplace subscription to a credit card.

### Change AWS Marketplace subscription account{#change-aws-marketplace-subscription-account}

1. Sign in to AWS Marketplace with the original AWS account you used for the subscription.

1. Cancel your Zilliz Cloud subscription. Refer to [Cancel your product subscription](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription) for more details.
    :::info Notes    
    
    
    It takes a few minutes for AWS Marketplace to complete the cancellation process.

    :::

1. Sign out of your original AWS account.

1. Sign in to AWS Marketplace with the new AWS account you want to use for the subscription.

1. Follow steps 1 to 4 in the [Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace#subscribe-on-aws-marketplace) section to complete your subscription to Zilliz Cloud with the new account.

### Switch to payment credit card{#switch-to-payment-credit-card}

1. Sign in to AWS Marketplace with the original AWS account you used for the subscription.

1. Cancel your Zilliz Cloud subscription. Refer to [Cancel your product subscription](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription) for more details.
    :::info Notes    
    
    
    It takes a few minutes for AWS Marketplace to complete the cancellation process.

    :::

1. Follow the steps in [Add a payment method](https://www.notion.so/7939e50c76bb473eb121f1feff57d4c8?pvs=21) to add a payment credit card.

1. Check out your current payment method in your billing overview.

## Pricing terms{#pricing-terms}

- Zilliz Cloud Standard Plan

    |  **Units**                                           |  **Cost**      |
    | ---------------------------------------------------- | -------------- |
    |  1 AWS performance-optimized CU per hour as one unit |  $0.159 / unit |
    |  1 AWS capacity-optimized CU per hour as one unit    |  $0.159 / unit |
    |  1 AWS cost-optimized CU per hour as one unit        |  $0.107 / unit |
    |  1 GB for storage on AWS per month as one unit       |  $0.025 / unit |
    |  1 GB for backup service on AWS as one unit          |  $0.025 / unit |
    |  1 GCP performance-optimized CU per hour as one unit |  $0.137 / unit |
    |  1 GCP capacity-optimized CU per hour as one unit    |  $0.137 / unit |
    |  1 GCP cost-optimized CU per hour as one unit        |  $0.091 / unit |
    |  1 GB for storage on GCP per month as one unit       |  $0.02 / unit  |
    |  1 GB for backup service on GCP as one unit          |  $0.02 / unit  |

- Zilliz Cloud Enterprise Plan

    |  **Units**                                           |  **Cost**      |
    | ---------------------------------------------------- | -------------- |
    |  1 AWS performance-optimized CU per hour as one unit |  $0.248 / unit |
    |  1 AWS capacity-optimized CU per hour as one unit    |  $0.248 / unit |
    |  1 AWS cost-optimized CU per hour as one unit        |  $0.159 / unit |
    |  1 GB for storage on AWS per month as one unit       |  $0.025 / unit |
    |  1 GB for backup service on AWS as one unit          |  $0.025 / unit |
    |  1 GCP performance-optimized CU per hour as one unit |  $0.215 / unit |
    |  1 GCP capacity-optimized CU per hour as one unit    |  $0.215 / unit |
    |  1 GCP cost-optimized CU per hour as one unit        |  $0.137 / unit |
    |  1 GB for storage on GCP per month as one unit       |  $0.02 / unit  |
    |  1 GB for backup service on GCP as one unit          |  $0.02 / unit  |

Using the above table, if you have deployed a vector database in the **Standard Plan** on Zilliz Cloud with one performance-optimized CU, you will be charged 159 units per hour, that is $0.159/hour.

To subscribe to Zilliz Cloud, please visit us on [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?sr=0-1&ref_=beagle&applicationId=AWSMPContessa).

## Related topics{#related-topics}

- [Subscribe by Adding Credit Card](./subscribe-by-adding-credit-card) 

- [View Invoice](./view-invoice) 
