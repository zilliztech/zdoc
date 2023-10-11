---
slug: /question-answering-using-zilliz-cloud-and-hugging-face
sidebar_position: 2
---



# Question Answering Using Zilliz Cloud and HuggingFace

This page illustrates how to build a question-answering system using Zilliz Cloud as the vector database and Hugging Face as the embedding system.

## Before you start{#before-you-start}

The code snippets on this page require the following packages to be installed: **pymilvus**, **transformers**, and **datasets**. The packages **transformers** and **datasets** are the Hugging Face packages to create the pipeline, and **pymilvus** is the client for Zilliz Cloud. If these packages are not present on your system, run the following commands to install them:

```bash
pip install transformers datasets pymilvus torch
```

Then you need to load the modules to be used in this guide.

```python
from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility
from datasets import load_dataset_builder, load_dataset, Dataset
from transformers import AutoTokenizer, AutoModel
from torch import clamp, sum
```

## Parameters{#parameters}

Here we can find the parameters used in the following snippets. Some of them need to be changed to fit your environment. Beside each is a description of what it is.

```python
DATASET = 'squad'  # Huggingface Dataset to use
MODEL = 'bert-base-uncased'  # Transformer to use for embeddings
TOKENIZATION_BATCH_SIZE = 1000  # Batch size for tokenizing operation
INFERENCE_BATCH_SIZE = 64  # batch size for transformer
INSERT_RATIO = .001  # How many titles to embed and insert
COLLECTION_NAME = 'huggingface_db'  # Collection name
DIMENSION = 768  # Embeddings size
LIMIT = 10  # How many results to search for
URI='https://replace-this-with-the-public-endpoint-of-your-cluster-on-zilliz-cloud'  # Endpoint URI obtained from Zilliz Cloud
USER='replace-this-with-the-cluster-user-name'  # Username specified when you created this database
PASSWORD='replace-this-with-the-cluster-password'  # Password set for that account
```

To know more about the model and dataset used on this page, refer to [bert-base-uncased](https://huggingface.co/bert-base-uncased) and [squad](https://huggingface.co/datasets/squad).

## Create a collection{#create-a-collection}

This section deals with Zilliz Cloud and setting up the cluster for this use case. Within Zilliz Cloud, we need to set up a collection and index it.

```python
# Connect to Zilliz Cloud cluster
connections.connect(uri=URI, user=USER, password=PASSWORD, secure=True)

# Remove the collection if it already exists
if utility.has_collection(COLLECTION_NAME):
    utility.drop_collection(COLLECTION_NAME)

# Create a collection which includes the id, title, and embedding
fields = [
    FieldSchema(name='id', dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name='original_question', dtype=DataType.VARCHAR, max_length=1000),
    FieldSchema(name='answer', dtype=DataType.VARCHAR, max_length=1000),
    FieldSchema(name='original_question_embedding', dtype=DataType.FLOAT_VECTOR, dim=DIMENSION)
]
schema = CollectionSchema(fields=fields)
collection = Collection(name=COLLECTION_NAME, schema=schema)

# Create an AutoIndex index for the collection
index_params = {
    'index_type': 'AUTOINDEX',
    'metric_type': 'L2'
    'params': {}
}
collection.create_index(field_name="original_question_embedding", index_params=index_params)
collection.load()
```

## Insert data{#insert-data}

Once we have the collection set up, we need to start inserting our data. This is done in three steps

- tokenizing the original question,

- embedding the tokenized question, and

- inserting the embedding, original question, and answer.

In this example, the data includes the original question, the original question's embedding, and the answer to the original question.

```python
data_dataset = load_dataset(DATASET, split='all')
# Generates a fixed subset. To generate a random subset, remove the seed setting. For details, see <https://huggingface.co/docs/datasets/v2.9.0/en/package_reference/main_classes#datasets.Dataset.train_test_split.seed>
data_dataset = data_dataset.train_test_split(test_size=INSERT_RATIO, seed = 42)['test']
# Clean up the data structure in the dataset
data_dataset = data_dataset.map(lambda val: {'answer': val['answers']['text'][0]}, remove_columns=['answers'])

tokenizer = AutoTokenizer.from_pretrained(MODEL)

# Tokenize the question into the format that BERT takes
def tokenize_question(batch):
    results = tokenizer(batch['question'], add_special_tokens = True, truncation = True, padding = "max_length", return_attention_mask = True, return_tensors = "pt")
    batch['input_ids'] = results['input_ids']
    batch['token_type_ids'] = results['token_type_ids']
    batch['attention_mask'] = results['attention_mask']
    return batch

# Generate the tokens for each entry
data_dataset = data_dataset.map(tokenize_question, batch_size=TOKENIZATION_BATCH_SIZE, batched=True)
# Set the ouput format to torch so it can be pushed into embedding model
data_dataset.set_format('torch', columns=['input_ids', 'token_type_ids', 'attention_mask'], output_all_columns=True)

model = AutoModel.from_pretrained(MODEL)
# Embed the tokenized question and take the mean pool with respect to attention mask of hidden layer
def embed(batch):
    sentence_embs = model(
                input_ids=batch['input_ids'],
                token_type_ids=batch['token_type_ids'],
                attention_mask=batch['attention_mask']
                )[0]
    input_mask_expanded = batch['attention_mask'].unsqueeze(-1).expand(sentence_embs.size()).float()
    batch['question_embedding'] = sum(sentence_embs * input_mask_expanded, 1) / clamp(input_mask_expanded.sum(1), min=1e-9)
    return batch

data_dataset = data_dataset.map(embed, remove_columns=['input_ids', 'token_type_ids', 'attention_mask'], batched = True, batch_size=INFERENCE_BATCH_SIZE)

# Due to the varchar constraint we are going to limit the question size when inserting
def insert_function(batch):
    insertable = [
        batch['question'],
        [x[:995] + '...' if len(x) > 999 else x for x in batch['answer']],
        batch['question_embedding'].tolist()
    ]    
    collection.insert(insertable)

data_dataset.map(insert_function, batched=True, batch_size=64)
collection.flush()
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
    res = collection.search(batch['question_embedding'].tolist(), anns_field='original_question_embedding', param = {}, output_fields=['answer', 'original_question'], limit = LIMIT)
    overall_id = []
    overall_distance = []
    overall_answer = []
    overall_original_question = []
    for hits in res:
        ids = []
        distance = []
        answer = []
        original_question = []
        for hit in hits:
            ids.append(hit.id)
            distance.append(hit.distance)
            answer.append(hit.entity.get('answer'))
            original_question.append(hit.entity.get('original_question'))
        overall_id.append(ids)
        overall_distance.append(distance)
        overall_answer.append(answer)
        overall_original_question.append(original_question)
    return {
        'id': overall_id,
        'distance': overall_distance,
        'answer': overall_answer,
        'original_question': overall_original_question
    }
question_dataset = question_dataset.map(search, batched=True, batch_size = 1)
for x in question_dataset:
    print()
    print('Question:')
    print(x['question'])
    print('Answer, Distance, Original Question')
    for x in zip(x['answer'], x['distance'], x['original_question']):
        print(x)
```

The output would vary with the subset of data you have downloaded if you leave [the ](https://zilliz.com/doc/integrate_with_hugging-face#Insert-data)`seed`[ parameter of the ](https://zilliz.com/doc/integrate_with_hugging-face#Insert-data)`train_test_split()` [method](https://www.notion.so/Question-Answering-Using-Zilliz-Cloud-and-Hugging-Face-e97086355e054fbbb5a10730dc2300a7?pvs=21) unspecified, and should be similar to the following:

```python
Question:
When did the premier league start?
Answer, Distance, Original Question
('1992', tensor(19.1790), 'In what year was the Premier League created?')
('1787', tensor(35.1203), 'When was the Tower constructed?')
('until 1870', tensor(36.0302), 'When did the Papal States exist?')
('1981', tensor(36.0476), "When was ZE's Mutant Disco released?")
('Sunday Times University of the Year award', tensor(39.2945), 'What did Newcastle University win in 2000?')
('terrorism', tensor(39.7199), 'What issue did Spielberg address in his movie Munich?')
('2019', tensor(40.9740), 'When will Argo be launched?')
('October 1992', tensor(41.4449), 'When were free elections held?')
('Misrata', tensor(41.7602), 'Where did an ambulance take Gaddafi after he was murdered?')
('Poland, Bulgaria, the Czech Republic, Slovakia, Hungary, Albania, former East Germany and Cuba', tensor(42.0978), 'Where was Russian schooling mandatory in the 20th century?')

Question:
Where did people learn russian?
Answer, Distance, Original Question
('Poland, Bulgaria, the Czech Republic, Slovakia, Hungary, Albania, former East Germany and Cuba', tensor(31.6751), 'Where was Russian schooling mandatory in the 20th century?')
('accomplishments', tensor(34.7001), 'What did Czech historians emphasize about their countrymen?')
('until 1870', tensor(37.2057), 'When did the Papal States exist?')
('1787', tensor(38.3059), 'When was the Tower constructed?')
('October 1992', tensor(40.4033), 'When were free elections held?')
('salt and iron', tensor(41.3883), 'What natural resources did the Chinese government have a monopoly on?')
('1992', tensor(41.5846), 'In what year was the Premier League created?')
('6,000 years', tensor(41.7438), 'How old did biblical scholars think the Earth was?')
('traders', tensor(42.1737), 'Along with fishermen, what sort of Japanese people visited the Marshalls?')
('1981', tensor(44.3291), "When was ZE's Mutant Disco released?")
```

## Related integrations{#related-integrations}

- [Similarity Search with Zilliz Cloud and OpenAI](./similarity-search-with-zilliz-cloud-and-openai) 

- [Question Answering Using Zilliz Cloud and Cohere](./question-answering-using-zilliz-cloud-and-cohere) 

- [Question Answering over Documents with Zilliz Cloud and LangChain](./question-answering-over-documents-with-zilliz-cloud-and-langchain) 

- [Image Search with Zilliz Cloud and PyTorch](./image-search-with-zilliz-cloud-and-pytorch) 

- [Documentation QA using Zilliz Cloud and LlamaIndex](./documentation-qa-using-zilliz-cloud-and-llamaindex) 

- [Movie Search Using Zilliz Cloud and SentenceTransformers](./movie-search-using-zilliz-cloud-and-sentencetransformers) 
