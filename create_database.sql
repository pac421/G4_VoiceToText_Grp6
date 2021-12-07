CREATE TABLE CONVERSATION
(
    id         VARCHAR(36) NOT NULL PRIMARY KEY,
    started_at DATETIME    NOT NULL,
    ended_at   DATETIME    NULL
);

CREATE TABLE KEYWORD
(
    id     VARCHAR(36)  NOT NULL PRIMARY KEY,
    label  VARCHAR(128) NOT NULL,
    action VARCHAR(255) NULL
);

CREATE TABLE CONVERSATION_KEYWORD
(
    id_conversation VARCHAR(36) NOT NULL, 
    id_keyword      VARCHAR(36) NOT NULL,
    created_at      DATETIME(3) NOT NULL,
    PRIMARY KEY(id_conversation, id_keyword, created_at)
);

ALTER TABLE CONVERSATION_KEYWORD
ADD FOREIGN KEY (id_conversation) REFERENCES CONVERSATION(id),
ADD FOREIGN KEY (id_keyword) REFERENCES KEYWORD(id);

INSERT INTO KEYWORD (id, label, action) VALUES
('e7827472-0553-4b26-b4d7-74c9b55cc8e6', 'demi-pension',     'Mettre le client en demi-pension.'),
('b29b3e79-8a28-4c8d-8675-da2c98f38bf0', 'petit-déjeuner',   'Ajouter un supplément petit-déjeuner au client.'),
('22be33e2-6ba5-41bf-b7c1-55a62e023629', 'hébergement seul', 'Mettre le client en hébergement seul.'),
('5fbcfb61-7220-468e-8a43-952c4f08ac61', 'pension complète', 'Mettre le client en pension complète.'),
('384b0840-ce58-4ae0-8b85-edd3004f53d3', 'tout inclus',      'Mettre le client en formule Tout inclus.'),
('e3bb9f0e-caa6-4e65-baf5-9900806870c6', 'all inclusive',    'Mettre le client en formule All inclusive.');
