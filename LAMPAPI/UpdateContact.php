<?php

    $inData = getRequestInfo();
    
    $name = $inData["name"];
    $phone = $inData["phone"];
    $email = $inData["email"];
    $userID = $inData["userID"];
    $contactID = $inData["contactID"];
    $firstname = $inData["firstname"];
    $lastname = $inData["lastname"];

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");     
    if( $conn->connect_error )
    {
        returnWithError( $conn->connect_error );
    }
    else
    {

        if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
           returnWithError("Invalid email format");
           exit();
        }

        // Updates contact information based on contact ID and user ID
        $stmt = $conn->prepare("UPDATE Contacts SET FirstName = ? , LastName = ? , Name = ?, Phone = ?, Email = ? WHERE ID = ? AND UserID = ?");
        $stmt->bind_param("sssssii", $firstname , $lastname ,$name, $phone, $email, $contactID, $userID);

        if($stmt->execute())
        {
            if($stmt->affected_rows > 0)
            {
                returnWithInfo("Contact updated successfully.");
            }
            else
            {
                returnWithError("No contact found with the given information or no changes made.");
            }
        }
        else
        {
            returnWithError("Error updating contact: " . $stmt->error);
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
