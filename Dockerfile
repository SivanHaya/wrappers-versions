FROM node:8

ARG workdir=/opt/app

RUN mkdir -p $workdir
COPY ./  $workdir

RUN cd $workdir && npm install

ENV TZ=Israel
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR $workdir

CMD /bin/bash
