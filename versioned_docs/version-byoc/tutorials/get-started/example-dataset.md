---
slug: /example-dataset
beta: FALSE
notebook: FALSE
type: origin
token: FCgWwFVtQiUy9GkDlQNcA0xZnPa
sidebar_position: 6

---

import Admonition from '@theme/Admonition';


# Example Dataset

In this user guide series, we'll explore an example dataset comprising details of over 5,000 Medium articles. These were published between January 2020 and August 2020 in notable publications.

## Acquire the dataset{#acquire-the-dataset}

The dataset resides in a publicly accessible S3 storage bucket. To fetch it, execute the following command:

```bash
# Get a CSV version of the dataset
curl https://assets.zilliz.com/medium_articles_2020_dpr_a13e0377ae.csv \
        --output medium_articles_2020_dpr.csv

# Get a JSON version of the dataset
curl https://assets.zilliz.com/medium_articles_2020_dpr_a13e0377ae.json \
        --output medium_articles_2020_dpr.json
```

Expected output

```bash
# Output
#
# % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
#                                  Dload  Upload   Total   Spent    Left  Speed
# 100 60.4M  100 60.4M    0     0  12.8M      0  0:00:04  0:00:04 --:--:-- 12.9M
```

For a comprehensive understanding of the dataset, refer to its [introduction page on Kaggle](https://www.kaggle.com/datasets/shiyu22chen/cleaned-medium-articles-dataset).

The acquired dataset is in JSON format, with a structure resembling:

```json
{
      "root": [
         {
             "id": ...
             "titile_vector": ...
             "title": ...
             "link": ...             
             "reading_time": ...             
             "publication": ...             
             "claps": ...             
             "responses": ...         
         },
         ...     
      ]  
 }
```

## Dataset schema{#dataset-schema}

Each record in the dataset possesses eight attributes. Familiarize yourself with this structure as it will guide you when establishing the schema for your collection.

<table>
   <tr>
     <th><strong>Field Name</strong></th>
     <th><strong>Type</strong></th>
     <th><strong>Attributes</strong></th>
   </tr>
   <tr>
     <td>id</td>
     <td>INT64</td>
     <td>N/A</td>
   </tr>
   <tr>
     <td>title_vector</td>
     <td>FLOAT_VECTOR</td>
     <td>Dimension: 768</td>
   </tr>
   <tr>
     <td>title</td>
     <td>VARCHAR</td>
     <td>Max length: 512</td>
   </tr>
   <tr>
     <td>link</td>
     <td>VARCHAR</td>
     <td>Max length: 512</td>
   </tr>
   <tr>
     <td>reading_time</td>
     <td>INT64</td>
     <td>N/A</td>
   </tr>
   <tr>
     <td>publication</td>
     <td>VARCHAR</td>
     <td>Max length: 512</td>
   </tr>
   <tr>
     <td>claps</td>
     <td>INT64</td>
     <td>N/A</td>
   </tr>
   <tr>
     <td>responses</td>
     <td>INT64</td>
     <td>N/A</td>
   </tr>
</table>

## Related topics{#related-topics}

- [Manage Collections](./manage-collections)

- [Insert, Upsert & Delete](./insert-update-delete)

- [Search, Query & Get](./search-query-get)

