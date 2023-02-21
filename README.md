# Kanbann-WebApp
Create Lists and Add cards to that list to group similar task.

## Feature Log

* If a user's logs in then won't be shown the login page on the next visit to the site, unless the user's logs out or manually types in the url.
* Multiple User can access the WebApp simultaneously.
* Visually differentiable which tasks are completed and overdue.
* Can change the cards from one list to another inside the edit card section.
* Export button sends the data in a .csv file to the user's mail.
* After clicking the export button, it won't respond for the next 15 seconds.
* Daily reminder and monthly report is sent to the user's email.
* Summary page shows a graph of Date vs Number of task completed and a brief summary of for each of the lists. 


## Points to Note
The complete WebApp runs only on Linux system.
Please download the Mail Hog application (Fake SMTP server) for your system, not be linux version. 
One can run the full WebApp in WSL and run the MailHog server in Windows.

## How to use
Before we could use the web app, we need to setup the environment and servers for it.
1) <b>Setting up the Flask server :</b>   
   - In a new Linux terminal tab, start the Flask server by typing 

             python3 main.py

2) <b> Setting up Redis server : </b>    
    - In a new Linux terminal tab, start the redis server by typing 

          redis-server
    
3) <b> Setting up Celery Worker and Celery Beat : </b>
    - In a new Linux terminal tab, start the Celery Workers and Beat together by typing 
    
          Celery -A celery_task.celery worker -l info -B    

------------------
## Test user
The application can be tested using a test user if you don't wish to register. Below are the credentials for the same

```python
username = 'abc@gmail.com'  # Case sensitive
password = '111'  
```
