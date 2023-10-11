# syntax=docker/dockerfile:1.3
FROM mcr.microsoft.com/playwright:v1.34.0-jammy

RUN npm install -g @playwright/test:1.34.0

ARG USER_ID
ARG GROUP_ID

RUN if ! getent group $GROUP_ID > /dev/null; then \
    groupadd -g $GROUP_ID myusergroup; \
fi

RUN useradd -u $USER_ID -g $GROUP_ID -m playwrightuser

USER playwrightuser

