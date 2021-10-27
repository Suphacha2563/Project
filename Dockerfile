## syntax=docker/dockerfile:1
#FROM python:3
#ENV PYTHONUNBUFFERED=1
#RUN mkdir code
#WORKDIR /code
#COPY Project1 /code/
#COPY requirements.txt /code/
#RUN pip install -r requirements.txt
#COPY . /code/


FROM python:3

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]