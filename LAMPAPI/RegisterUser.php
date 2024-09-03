<?php

    $inData = getRequestInfo();
    
    $firstName = $inData["FirstName"];
    $lastName = $inData["LastName"];
    $login = $inData["Login"];
    $password = $inData["Password"];

    // Create connection
    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");     
    if( $conn->connect_error )
    {
        returnWithError( $conn->connect_error );
    }
    else
    {
        // Check if login already exists
        $stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
        $stmt->bind_param("s", $login);
        $stmt->execute();
        $stmt->store_result();

        if($stmt->num_rows > 0)
        {
            returnWithError("Login already exists.");
        }
        else
        {
            // If login is unique, insert the new user
            $stmt->close();
            $stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $firstName, $lastName, $login, $password);

            if($stmt->execute())
            {
                returnWithInfo("User registered successfully.");
            }
            else
            {
                returnWithError("Error registering user: " . $stmt->error);
            }
        }

        $stmt->close();
        $conn->close();
    }

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson( $obj )
    {
        header('Content-type: application/json');
        echo $obj;
    }
    
    function returnWithError( $err )
    {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson( $retValue );
    }
    
    function returnWithInfo( $info )
    {
        $retValue = '{"result":"' . $info .'","error":""}';
        sendResultInfoAsJson( $retValue );
    }
    
?>
