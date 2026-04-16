Pour configurer la validation par email : 
_ Allez dans parametre compte google
_ Puis dans "securité et connection" activer "Validation en deux etapes"
_ Ensuite rechercher mot de passe d'application 
_ Apres ajouter un nom et generer un mot de passe d'application et remplire dans .env le champ SMTP_PASS sans espaces.
_ SMTP_HOST=smtp.gmail.com et SMTP_PORT=578 pour gmail
_ Et votre email pour SMTP_USER et SMTP_FROM



Les commandes prisma : 
_ npx prisma migrate dev --name nom_de_votre_migration
_ npx prisma generate