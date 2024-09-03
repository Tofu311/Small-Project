<?php

    $inData = getRequestInfo();
    
    $name = $inData["name"];
    $phone = $inData["phone"];
    $email = $inData["email"];
    $userID = $inData["userID"];

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");     
    if( $conn->connect_error )
    {
        returnWithError( $conn->connect_error );
    }
    else
    {
        $stmt = $conn->prepare("INSERT INTO Contacts (Name, Phone, Email, UserID) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("sssi", $name, $phone, $email, $userID);

        if($stmt->execute())
        {
            returnWithInfo("Contact added successfully.");
        }
        else
        {
            returnWithError("Error adding contact: " . $stmt->error);
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
