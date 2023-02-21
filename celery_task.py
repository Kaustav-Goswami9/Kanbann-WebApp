import csv
import os
from datetime import date, datetime

from celery.schedules import crontab
from jinja2 import Template
from weasyprint import HTML

from mail_config import send_email
from main import celery, cache
from models import Card, List, User


@celery.on_after_finalize.connect
def setup_intervalTASK(sender, **kwargs):
    sender.add_periodic_task(
        # Send a remainder at 5:30pm IST of every day
        # crontab(minute=30, hour=17),
        180,
        daily_rem.s(), name="Daily reminder"
    )

    sender.add_periodic_task(
        # Send the monthly report at 5:30pm IST of every month
        # crontab(minute=30, hour=17, day_of_month=25),
        180,
        monthly_report.s(), name="Monthly Report"
    )


@celery.task()
@cache.memoize(timeout=15)
def exList(lid: int, email: str, uid: int):
    username = email.split('@')[0]

    filepath = 'static/download/'+username+'_List_details.csv'

    # Check if folder is not present then create one
    if not os.path.exists('static/download/'):
        os.mkdir(path='static/download/')
    # Create the csv file
    with open(file=filepath, mode='w') as file:
        csv_obj = csv.writer(file, delimiter=',')
        csv_obj.writerow(['List id', 'List Name', 'Description',
                          'Number of cards created'])

        # If lid is -1 that means all the list's details
        if lid == -1:
            lid = List.query.filter_by(user_id=uid).all()
        else:
            lid = List.query.filter_by(list_id=lid).all()

        for list_data in lid:
            csv_obj.writerow([list_data.list_id, list_data.name, list_data.description,
                              len(list_data.cards)])

    with open(r"templates/download.html") as file:
        msg_template = Template(file.read())
    if len(lid) == 1:
        send_email(to=email, subject="CSV file for the list-name "+list_data.name,
                   msg=msg_template.render(username=username, list_name=list_data.name), attachment=filepath)
    else:
        send_email(to=email, subject="CSV file for the all the lists created",
                   msg=msg_template.render(username=username, list=lid), attachment=filepath)
    return 'sucess'


@celery.task()
@cache.memoize(timeout=15)
def exCard(cid: int, email: str):
    username = email.split('@')[0]
    card_data = Card.query.filter_by(card_id=cid).first()
    list_name = List.query.filter_by(list_id=card_data.list_id).first().name
    filepath = 'static/download/'+username+'_'+card_data.title+'.csv'

    with open(r"templates/download.html") as file:
        msg_template = Template(file.read())

    # Create the csv file
    with open(file=filepath, mode='w') as file:
        csv_obj = csv.writer(file, delimiter=',')

        csv_obj.writerow(['Card id', 'Card Name', 'Content', 'Created On',
                         'Last Updated on', 'Deadline', 'Completed On', 'List name'])
        if card_data.flag:
            csv_obj.writerow([cid, card_data.title, card_data.content, card_data.created,
                             card_data.updated, card_data.deadline, card_data.completed, list_name])
        else:
            csv_obj.writerow([cid, card_data.title, card_data.content, card_data.created,
                              card_data.updated, card_data.deadline, 'Not yet completed', list_name])

    send_email(to=email, subject="CSV file for the card-name "+card_data.title,
               msg=msg_template.render(username=username, card=card_data.title), attachment=filepath)
    return 'sucess'


@celery.task()
def daily_rem():
    users = User.query.all()
    for user in users:
        username = user.email.split('@')[0]
        list_data = List.query.filter_by(user_id=user.user_id).all()
        cards = Card.query.filter(
            Card.list_id.in_([lt.list_id for lt in list_data])).all()

        data = {'overdue': len([1 for c in cards if not c.flag and
                                datetime.strptime(c.deadline, "%Y-%m-%dT%H:%M") < datetime.now()]),
                'incomplete': len([1 for c in cards if not c.flag])}

        with open(r"templates/daily_reminder.html") as file:
            msg_template = Template(file.read())
        send_email(to=user.email, subject="Daily reminder",
                   msg=msg_template.render(username=username, data=data))
    return 'sucess'


@celery.task()
def monthly_report():
    users = User.query.all()
    month = date.today().strftime("%B")
    for user in users:
        u = {'logged': user.last_logged, 'email': user.email}
        u['username'] = user.email.split('@')[0]
        card_data = []
        for lt in user.lists:
            card_data += Card.query.filter_by(list_id=lt.list_id).all()

        filepath = f"static/monthly_reports/monthly_report_{str(u['username'])}_{month}.pdf"

        # Check if folder is not present then create one
        if not os.path.exists('static/monthly_reports/'):
            os.mkdir(path='static/monthly_reports/')

        with open(r"templates/monthly_report.html") as file:
            msg_template = Template(file.read())
        with open(r"templates/pdf.html") as file:
            pdf_template = Template(file.read())
        pdf_html = HTML(string=pdf_template.render(user=u, cards=card_data,
                                                   list_info=user.lists, month=month))
        pdf_html.write_pdf(target=filepath)

        send_email(to=user.email, subject="Monthly report", attachment=filepath,
                   msg=msg_template.render(username=u['username']))
    return 'sucess'
