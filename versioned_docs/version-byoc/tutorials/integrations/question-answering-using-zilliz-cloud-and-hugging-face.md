---
title: "Question Answering Using Zilliz Cloud and HuggingFace | BYOC"
slug: /question-answering-using-zilliz-cloud-and-hugging-face
sidebar_label: "With HuggingFace"
beta: FALSE
notebook: FALSE
description: "This page illustrates how to build a question-answering system using Zilliz Cloud as the vector database and Hugging Face as the embedding system. | BYOC"
type: origin
token: RWxKwfwFniNU1skCVCgcrKHbnCd
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - huggingface

---

import Admonition from '@theme/Admonition';


# Question Answering Using Zilliz Cloud and HuggingFace

This page illustrates how to build a question-answering system using Zilliz Cloud as the vector database and Hugging Face as the embedding system.

## Before you start{#before-you-start}

The code snippets on this page require the following packages to be installed: **pymilvus**, **transformers**, and **datasets**. The packages **transformers** and **datasets** are the Hugging Face packages to create the pipeline, and **pymilvus** is the client for Zilliz Cloud. If these packages are not present on your system, run the following commands to install them:

```bash
pip install transformers datasets pymilvus torch
```

Then you need to load the modules to be used in this guide.

```python
from pymilvus import connections, DataType, CollectionSchema, FieldSchema, Collection, utility
from datasets import load_dataset_builder, load_dataset, Dataset
from transformers import AutoTokenizer, AutoModel
from torch import clamp, sum
import time
```

## Parameters{#parameters}

Here we can find the parameters used in the following snippets. Some of them need to be changed to fit your environment. Beside each is a description of what it is.

```python
# 1. Set the name of a dataset available on HuggingFace.
DATASET = 'squad' 

# 2. Set parameters for the generation of a subset of the dataset.
MODEL = 'bert-base-cased'
TOKENIZATION_BATCH_SIZE = 1000
INFERENCE_BATCH_SIZE = 64
INSERT_RATIO = 0.01

# 3. Set up the name of the collection to be created.
COLLECTION_NAME = 'huggingface_db'

# 4. Set up the dimension of the embeddings.
DIMENSION = 768

# 5. Set the number of records to return.
LIMIT = 100

# 6. Set up the connection parameters for your Zilliz Cloud cluster.
URI = 'YOUR_CLUSTER_ENDPOINT'
TOKEN = 'YOUR_CLUSTER_TOKEN'

```

To know more about the model and dataset used on this page, refer to [bert-base-uncased](https://huggingface.co/bert-base-uncased) and [squad](https://huggingface.co/datasets/squad).

## Create a collection{#create-a-collection}

This section deals with Zilliz Cloud and setting up the cluster for this use case. Within Zilliz Cloud, we need to set up a collection and index it.

```python
# Connect to Zilliz Cloud and create a collection

connections.connect(
    alias='default',
    # Public endpoint obtained from Zilliz Cloud
    uri=URI,
    token=TOKEN
)

if COLLECTION_NAME in utility.list_collections():
    utility.drop_collection(COLLECTION_NAME)

fields = [
    FieldSchema(name='id', dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name='original_question', dtype=DataType.VARCHAR, max_length=1000),
    FieldSchema(name='answer', dtype=DataType.VARCHAR, max_length=1000),
    FieldSchema(name='original_question_embedding', dtype=DataType.FLOAT_VECTOR, dim=DIMENSION)
]

schema = CollectionSchema(fields=fields)

collection = Collection(
    name=COLLECTION_NAME,
    schema=schema,
)

index_params = {
    'metric_type': 'L2',
    'index_type': 'AUTOINDEX',
    'params': {}
}

collection.create_index(
    field_name='original_question_embedding',
    index_params=index_params
)

collection.load()

```

## Insert data{#insert-data}

Once we have the collection set up, we need to start inserting our data. This is done in three steps

- tokenizing the original question,

- embedding the tokenized question, and

- inserting the embedding, original question, and answer.

In this example, the data includes the original question, the original question's embedding, and the answer to the original question.

```python
# Load the dataset and extract a subset

data_dataset = load_dataset(DATASET, split='all')
data_dataset = data_dataset.train_test_split(test_size=INSERT_RATIO, seed=42)['test']
data_dataset = data_dataset.map(
    lambda val: {'answer': val['answers']['text'][0]}, 
    remove_columns=['answers']
)

tokenizer = AutoTokenizer.from_pretrained(MODEL)

# Tokenize the question into the format that BERT takes
def tokenize_question(batch):
    results = tokenizer(
        batch['question'],
        add_special_tokens=True,
        truncation=True,
        padding = "max_length", 
        return_attention_mask = True, 
        return_tensors = "pt"
    )

    batch['input_ids'] = results['input_ids']
    batch['token_type_ids'] = results['token_type_ids']
    batch['attention_mask'] = results['attention_mask']

    return batch

# Generate the tokens for each entry
data_dataset = data_dataset.map(
    tokenize_question, 
    batched=True, 
    batch_size=TOKENIZATION_BATCH_SIZE
)

# Set the output format to torch so it can be pushed into embedding model
data_dataset.set_format(
    type='torch', 
    columns=['input_ids', 'token_type_ids', 'attention_mask'],
    output_all_columns=True
)

# Embed the tokenized question and take the mean pool with respect to attention mask of hidden layer

model = AutoModel.from_pretrained(MODEL)

def embed(batch):
    sentence_embs = model(
        input_ids=batch['input_ids'],
        token_type_ids=batch['token_type_ids'],
        attention_mask=batch['attention_mask']
    )[0]
    input_mask_expanded = batch['attention_mask'].unsqueeze(-1).expand(sentence_embs.size()).float()
    batch['question_embedding'] = sum(sentence_embs * input_mask_expanded, 1) / clamp(input_mask_expanded.sum(1), min=1e-9)
    return batch

data_dataset = data_dataset.map(
    embed, 
    batched=True, 
    batch_size=INFERENCE_BATCH_SIZE,
    remove_columns=['input_ids', 'token_type_ids', 'attention_mask']
)

# Due to the varchar constraint we are going to limit the question size when inserting
def insert_function(batch):
    insertable = [
        {
            'original_question': x,
            'answer': batch['answer'][i],
            'original_question_embedding': batch['question_embedding'].tolist()[i]
        } for i, x in enumerate(batch['question'])
    ]

    collection.insert(data=insertable)

data_dataset.map(insert_function, batched=True, batch_size=64)

time.sleep(5)
```

## Ask questions{#ask-questions}

Once all the data is inserted and indexed within Zilliz Cloud, we can ask questions and see what the closest answers are.

```python
questions = {'question':['When did the premier league start?', 'Where did people learn russian?']}
question_dataset = Dataset.from_dict(questions)

question_dataset = question_dataset.map(tokenize_question, batched = True, batch_size=TOKENIZATION_BATCH_SIZE)
question_dataset.set_format('torch', columns=['input_ids', 'token_type_ids', 'attention_mask'], output_all_columns=True)
question_dataset = question_dataset.map(embed, remove_columns=['input_ids', 'token_type_ids', 'attention_mask'], batched = True, batch_size=INFERENCE_BATCH_SIZE)

def search(batch):
    res = collection.search(
        data=batch['question_embedding'].tolist(),
        anns_field='original_question_embedding',
        param={},
        output_fields=['answer', 'original_question'], 
        limit = LIMIT
    )
    overall_id = []
    overall_distance = []
    overall_answer = []
    overall_original_question = []
    for hits in res:
        overall_id.append(hits.ids)
        overall_distance.append(hits.distances)
        overall_answer.append([ x.entity.get("answer") for x in hits])
        overall_original_question.append([ x.entity.get("original_question") for x in hits])
    return {
        'id': overall_id,
        'distance': overall_distance,
        'answer': overall_answer,
        'original_question': overall_original_question
    }
question_dataset = question_dataset.map(search, batched=True, batch_size = 1)

ret = ""

for x in question_dataset:
    ret += "\n\n"
    ret += "Question:\n"
    ret += x["question"] + "\n"
    ret += "Answer, Distance, Original Question\n"
    for x in zip(x["answer"], x["distance"], x["original_question"]):
        ret += str(x) + "\n"

    print(ret)
```

The output would vary with the subset of data you have downloaded if you leave [the ](./question-answering-using-zilliz-cloud-and-hugging-face#insert-data)`seed`[ parameter of the ](./question-answering-using-zilliz-cloud-and-hugging-face#insert-data)`train_test_split()`[ method](./question-answering-using-zilliz-cloud-and-hugging-face#insert-data) unspecified, and should be similar to the following:

```python
# Output
#
# Question:
# When did the premier league start?
# Answer, Distance, Original Question
# ('1992', tensor(15.8973), 'In what year was the Premier League created?')
# ('mid-fifteenth century', tensor(21.2091), 'When did Sikhism begin?')
# ('around July 3', tensor(21.5117), "When does Tucson's monsoon usually start?")
# ('March 20, 1880', tensor(21.7186), 'When did Tucson get a railroad?')
# ('the Football Bowl Subdivision', tensor(22.8579), 'What is the name of the highest level of college football?')
# ('the district of Germersheim', tensor(23.1635), 'When did the expert commission deliver its report?')
# ('at an Earth Day rally', tensor(23.4384), 'Where did Kerry and Teresa meet?')
# ('April 26', tensor(23.4490), 'When did the torch arrive in Nagano?')
# ('1630', tensor(23.5346), 'When was Boston founded?')
# ('with the signing of the Treaty of Coche by both the centralist government of the time and the Federal Forces', tensor(23.6430), 'How did the federal war end? ')

# Question:
# Where did people learn russian?
# Answer, Distance, Original Question
# ('accomplishments', tensor(23.7489), 'What did Czech historians emphasize about their countrymen?')
# ('people were asked to rate themselves on a scale from completely heterosexual to completely homosexual.', tensor(23.7928), 'What where people asked to do in these research studies?')
# ('Wardenclyffe', tensor(24.7777), 'What did Tesla establish following his Colorado experiments?')
# ('traders', tensor(26.1855), 'Along with fishermen, what sort of Japanese people visited the Marshalls?')
# ('1816 to 1821', tensor(26.2205), 'During what years did Chopin receive instruction from  Żywny?')
# ('Poland, Bulgaria, the Czech Republic, Slovakia, Hungary, Albania, former East Germany and Cuba', tensor(26.3033), 'Where was Russian schooling mandatory in the 20th century?')
# ('March 20, 1880', tensor(26.4897), 'When did Tucson get a railroad?')
# ('Worms', tensor(26.6245), 'Where did Luther refuse to change his beliefs?')
# ('Collaborationist units', tensor(26.8737), 'What type of soldiers came from Hong Kong? ')
# ('1996', tensor(27.1454), 'When did Ross Sackett study time and energy for hunter-gartherer groups?')
```

## Related integrations{#related-integrations}

- [Similarity Search with Zilliz Cloud and OpenAI](./similarity-search-with-zilliz-cloud-and-openai)

- [Question Answering Using Zilliz Cloud and Cohere](./question-answering-using-zilliz-cloud-and-cohere)

- [Question Answering over Documents with Zilliz Cloud and LangChain](./question-answering-over-documents-with-zilliz-cloud-and-langchain)

- [Image Search with Zilliz Cloud and PyTorch](./image-search-with-zilliz-cloud-and-pytorch)

- [Documentation QA using Zilliz Cloud and LlamaIndex](./rag-with-zilliz-cloud-and-llamaindex)

- [Movie Search Using Zilliz Cloud and SentenceTransformers](./movie-search-using-zilliz-cloud-and-sentencetransformers) 

