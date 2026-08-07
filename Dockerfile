# Unprivileged nginx: runs as uid 101, listens on 8080 — no root, and no
# NET_BIND_SERVICE capability needed, so the container can drop ALL caps.
FROM nginxinc/nginx-unprivileged:1.27-alpine

# Ship our own server block (strict CSP + method limits + dotfile denial).
COPY default.conf /etc/nginx/conf.d/default.conf
COPY index.html style.css app.js icon.svg icon.png apple-touch-icon.png /usr/share/nginx/html/

# Synology source dirs carry ACLs that COPY preserves (e.g. 0770); the nginx
# worker then cannot read the files and every request 403s. Normalize, and
# make the docroot read-only to the runtime user while we still have root.
USER root
RUN chmod 0644 /usr/share/nginx/html/* \
               /etc/nginx/conf.d/default.conf \
 && chown -R root:root /usr/share/nginx/html
USER 101

EXPOSE 8080
