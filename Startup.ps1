$LogFilePath = "C:\Logs\loga.txt"

function LogEvent($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "$timestamp - $message"
    $logEntry | Out-File -Append -FilePath $LogFilePath
}

# Lista trenutno pokrenutih servisa
$existingServices = Get-Service | Where-Object { $_.Status -eq 'Running' } | Select-Object -ExpandProperty DisplayName

# Beskonačna petlja koja prati promjene u servisima
while ($true) {
    # Dobivanje trenutno pokrenutih servisa
    $currentServices = Get-Service | Where-Object { $_.Status -eq 'Running' } | Select-Object -ExpandProperty DisplayName

    # Pronalaženje novih servisa
    $newServices = Compare-Object -ReferenceObject $existingServices -DifferenceObject $currentServices | Where-Object { $_.SideIndicator -eq '=>' }

    # Zabilježavanje pokretanja novih servisa
    foreach ($service in $newServices) {
        LogEvent "Novi servis '$($service.InputObject)' je pokrenut."
    }

    # Pronalaženje zaustavljenih servisa
    $stoppedServices = Compare-Object -ReferenceObject $existingServices -DifferenceObject $currentServices | Where-Object { $_.SideIndicator -eq '<=' }

    # Zabilježavanje gašenja servisa
    foreach ($service in $stoppedServices) {
        LogEvent "Servis '$($service.InputObject)' je zaustavljen."
    }

    # Postavljanje trenutnih servisa kao referentnih za sljedeću iteraciju
    $existingServices = $currentServices

    # Pauzirajte izvršenje skripte na određeno vrijeme prije nego što ponovno provjeri servise
    Start-Sleep -Seconds 5
}

# Lista trenutno pokrenutih procesa
$existingProcesses = Get-Process | Select-Object -ExpandProperty ProcessName

# Beskonačna petlja koja prati promjene u procesima
while ($true) {
    # Dobivanje trenutno pokrenutih procesa
    $currentProcesses = Get-Process | Select-Object -ExpandProperty ProcessName

    # Pronalaženje novih procesa
    $newProcesses = Compare-Object -ReferenceObject $existingProcesses -DifferenceObject $currentProcesses | Where-Object { $_.SideIndicator -eq '=>' }

    # Zabilježavanje pokretanja novih procesa
    foreach ($process in $newProcesses) {
        LogEvent "Novi proces '$($process.InputObject)' je pokrenut."
    }

    # Pronalaženje zaustavljenih procesa
    $stoppedProcesses = Compare-Object -ReferenceObject $existingProcesses -DifferenceObject $currentProcesses | Where-Object { $_.SideIndicator -eq '<=' }

    # Zabilježavanje gašenja procesa
    foreach ($process in $stoppedProcesses) {
        LogEvent "Proces '$($process.InputObject)' je zaustavljen."
    }

    # Postavljanje trenutnih procesa kao referentnih za sljedeću iteraciju
    $existingProcesses = $currentProcesses

    # Pauzirajte izvršenje skripte na određeno vrijeme prije nego što ponovno provjeri procese
    Start-Sleep -Seconds 5
}

while ($true) {
    # Praćenje događaja prijava i odjava
    Get-WinEvent -LogName 'Security' -FilterXPath "*[System[(EventID=4624 or EventID=4634)]]" | ForEach-Object {
        $timestamp = $_.TimeCreated
        $eventID = $_.Id
        $username = $_.Properties[5].Value

        if ($eventID -eq 4624) {
            $logMessage = "Uspješna prijava za korisnika '$username'."
        } elseif ($eventID -eq 4634) {
            $logMessage = "Odjava za korisnika '$username'."
        }

        LogEvent $logMessage
    }

    # Pauzirajte izvršenje skripte na određeno vrijeme prije nego što ponovno provjeri događaje
    Start-Sleep -Seconds 5
}